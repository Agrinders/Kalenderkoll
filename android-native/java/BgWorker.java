package se.agrinders.kalenderkoll;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/* Runs about every 15 minutes, also when the app is closed.
   It reads the shared calendar straight from Firebase, tells you when your partner has added something,
   and puts new one-off events into the home-screen widget. The app leaves what it needs in bg.json. */
public class BgWorker extends Worker {
    static final String PREFS = "kk_bg";
    static final String CHANNEL = "partner";

    public BgWorker(@NonNull Context ctx, @NonNull WorkerParameters p) { super(ctx, p); }

    static String readFile(File f) throws Exception {
        FileInputStream in = new FileInputStream(f);
        String s = readAll(in);
        in.close();
        return s;
    }

    static String readAll(InputStream in) throws Exception {
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        byte[] b = new byte[8192];
        int n;
        while ((n = in.read(b)) > 0) o.write(b, 0, n);
        return new String(o.toByteArray(), StandardCharsets.UTF_8);
    }

    static void writeFile(File f, String s) throws Exception {
        FileOutputStream out = new FileOutputStream(f);
        out.write(s.getBytes(StandardCharsets.UTF_8));
        out.close();
    }

    static JSONObject http(String method, String url, String body, String token) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setRequestMethod(method);
        c.setConnectTimeout(15000);
        c.setReadTimeout(20000);
        c.setRequestProperty("Referer", "https://agrinders.github.io/");
        if (token != null) c.setRequestProperty("Authorization", "Bearer " + token);
        if (body != null) {
            c.setDoOutput(true);
            c.setRequestProperty("Content-Type", "application/json");
            OutputStream o = c.getOutputStream();
            o.write(body.getBytes(StandardCharsets.UTF_8));
            o.close();
        }
        int code = c.getResponseCode();
        InputStream in = code >= 400 ? c.getErrorStream() : c.getInputStream();
        String s = in == null ? "{}" : readAll(in);
        c.disconnect();
        if (code >= 400) throw new Exception("HTTP " + code + " " + s);
        return new JSONObject(s);
    }

    /* A sign-in of its own, kept between runs so the job does not create a new one each time. */
    String token(String key) throws Exception {
        SharedPreferences p = getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String rt = p.getString("rt", "");
        if (!rt.isEmpty()) {
            try {
                JSONObject r = http("POST", "https://securetoken.googleapis.com/v1/token?key=" + key,
                        "{\"grant_type\":\"refresh_token\",\"refresh_token\":" + JSONObject.quote(rt) + "}", null);
                p.edit().putString("rt", r.optString("refresh_token", rt)).apply();
                return r.getString("id_token");
            } catch (Exception e) { /* falls through to a new sign-in */ }
        }
        JSONObject r = http("POST", "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + key, "{\"returnSecureToken\":true}", null);
        p.edit().putString("rt", r.getString("refreshToken")).apply();
        return r.getString("idToken");
    }

    static String str(JSONObject f, String k) {
        JSONObject v = f == null ? null : f.optJSONObject(k);
        if (v == null) return "";
        if (v.has("stringValue")) return v.optString("stringValue");
        if (v.has("integerValue")) return v.optString("integerValue");
        if (v.has("doubleValue")) return v.optString("doubleValue");
        return "";
    }

    @NonNull
    @Override
    public Result doWork() {
        Context ctx = getApplicationContext();
        try {
            File bgf = new File(ctx.getFilesDir(), "bg.json");
            if (!bgf.exists()) return Result.success();
            JSONObject bg = new JSONObject(readFile(bgf));
            String space = bg.optString("space"), key = bg.optString("key"), project = bg.optString("project"), me = bg.optString("me");
            if (space.length() < 20 || key.isEmpty() || project.isEmpty()) return Result.success();
            boolean sv = !"en".equals(bg.optString("lang", "sv"));
            JSONObject names = bg.optJSONObject("names");
            String partner = names == null ? "" : names.optString("a".equals(me) ? "b" : "a", "");
            if (partner.isEmpty()) partner = sv ? "Din partner" : "Your partner";

            String tok = token(key);
            List<JSONObject[]> docs = new ArrayList<>();
            String page = "";
            for (int i = 0; i < 12; i++) {
                String url = "https://firestore.googleapis.com/v1/projects/" + project + "/databases/(default)/documents/spaces/"
                        + URLEncoder.encode(space, "UTF-8") + "/cal?pageSize=300" + (page.isEmpty() ? "" : "&pageToken=" + URLEncoder.encode(page, "UTF-8"));
                JSONObject r = http("GET", url, null, tok);
                JSONArray a = r.optJSONArray("documents");
                if (a != null) for (int j = 0; j < a.length(); j++) {
                    JSONObject d = a.getJSONObject(j);
                    String name = d.optString("name");
                    JSONObject idHolder = new JSONObject().put("id", name.substring(name.lastIndexOf('/') + 1));
                    docs.add(new JSONObject[]{idHolder, d.optJSONObject("fields")});
                }
                page = r.optString("nextPageToken", "");
                if (page.isEmpty()) break;
            }

            /* What counts as new: not seen by the app the last time it ran, and not told about already. */
            Set<String> seen = new HashSet<>();
            JSONArray sa = bg.optJSONArray("seen");
            if (sa != null) for (int i = 0; i < sa.length(); i++) seen.add(sa.optString(i));
            SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            Set<String> told = new HashSet<>(p.getStringSet("told", new HashSet<String>()));
            boolean first = !p.getBoolean("init", false);
            List<JSONObject> fresh = new ArrayList<>();
            List<String> freshIds = new ArrayList<>();
            for (JSONObject[] d : docs) {
                String id = d[0].getString("id");
                if (!id.matches("^(ev|note|todo|bd|memo)_.*") || seen.contains(id) || told.contains(id)) continue;
                JSONObject f = d[1];
                String by = str(f, "by");
                if (by.isEmpty()) by = str(f, "f");
                if (!by.isEmpty() && by.equals(me)) continue;
                fresh.add(f);
                freshIds.add(id);
            }
            told.addAll(freshIds);
            if (told.size() > 3000) told = new HashSet<>(freshIds);
            p.edit().putStringSet("told", told).putBoolean("init", true).apply();
            if (!freshIds.isEmpty()) {
                JSONArray all = new JSONArray();
                for (String t : told) all.put(t);
                writeFile(new File(ctx.getFilesDir(), "bg_told.json"), all.toString());
            }
            if (!first && !fresh.isEmpty()) notifyNew(ctx, sv, partner, fresh);
            try { listChanges(ctx, sv, partner, me, bg, docs, freshIds); } catch (Exception e) { /* lists are told next time */ }
            if (!fresh.isEmpty()) addToWidget(ctx, fresh);
            return Result.success();
        } catch (Exception e) {
            return Result.retry();
        }
    }

    /* Points and ticked points in a note's lists, counted the same way as in the app. */
    static int[] counts(JSONObject f) {
        int n = 0, done = 0;
        JSONObject bl = f == null ? null : f.optJSONObject("bl");
        JSONArray vals = bl == null || bl.optJSONObject("arrayValue") == null ? null : bl.optJSONObject("arrayValue").optJSONArray("values");
        if (vals != null) for (int i = 0; i < vals.length(); i++) {
            JSONObject m = vals.optJSONObject(i);
            JSONObject b = m == null || m.optJSONObject("mapValue") == null ? null : m.optJSONObject("mapValue").optJSONObject("fields");
            if (b == null || !"c".equals(str(b, "t")) || str(b, "x").trim().isEmpty()) continue;
            n++;
            JSONObject d = b.optJSONObject("d");
            if (d != null && d.optBoolean("booleanValue", false) && str(b, "m").isEmpty()) done++;
        }
        return new int[]{n, done};
    }

    /* When your partner adds to or ticks off a shared list, you hear about it. The app leaves the counts it has
       already shown you in bg.json; the job keeps its own after each notice, until the app has been opened again. */
    void listChanges(Context ctx, boolean sv, String partner, String me, JSONObject bg, List<JSONObject[]> docs, List<String> freshIds) throws Exception {
        SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        JSONObject appMc = bg.optJSONObject("mc");
        if (appMc == null) return;
        String appStr = appMc.toString();
        JSONObject base = appMc;
        if (appStr.equals(p.getString("mcsrc", ""))) {
            try { base = new JSONObject(p.getString("mcb", "{}")); } catch (Exception e) { base = appMc; }
        }
        JSONObject now = new JSONObject();
        List<String[]> told = new ArrayList<>();
        for (JSONObject[] d : docs) {
            String id = d[0].getString("id");
            if (!id.startsWith("memo_") || freshIds.contains(id)) continue;
            JSONObject f = d[1];
            if (f == null) continue;
            JSONObject pv = f.optJSONObject("priv");
            if (pv != null && (pv.optInt("integerValue", 0) != 0 || "1".equals(pv.optString("integerValue")))) continue;
            if (!str(f, "del").isEmpty() && !"0".equals(str(f, "del"))) continue;
            int[] c = counts(f);
            now.put(id, new JSONArray().put(c[0]).put(c[1]));
            JSONArray was = base.optJSONArray(id);
            String ub = str(f, "ub");
            if (was == null || ub.isEmpty() || ub.equals(me)) continue;
            int add = Math.max(0, c[0] - was.optInt(0)), tick = Math.max(0, c[1] - was.optInt(1));
            if (add > 0 || tick > 0) told.add(new String[]{str(f, "ti"), String.valueOf(add), String.valueOf(tick)});
        }
        p.edit().putString("mcsrc", appStr).putString("mcb", now.toString()).apply();
        if (told.isEmpty()) return;
        String text;
        if (told.size() > 1) text = sv ? partner + " har ändrat i " + told.size() + " listor" : partner + " changed " + told.size() + " lists";
        else {
            String[] t = told.get(0);
            String ti = t[0].isEmpty() ? (sv ? "en anteckning" : "a note") : t[0];
            int a = Integer.parseInt(t[1]), k = Integer.parseInt(t[2]);
            if (a > 0 && k > 0) text = sv ? partner + " lade till " + (a == 1 ? "en sak" : a + " saker") + " och bockade av " + (k == 1 ? "en" : String.valueOf(k)) + " i " + ti : partner + " added " + (a == 1 ? "a thing" : a + " things") + " and ticked off " + (k == 1 ? "one" : String.valueOf(k)) + " in " + ti;
            else if (a > 0) text = sv ? partner + " lade till " + (a == 1 ? "en sak" : a + " saker") + " i " + ti : partner + " added " + (a == 1 ? "a thing" : a + " things") + " to " + ti;
            else text = sv ? partner + " bockade av " + (k == 1 ? "en sak" : k + " saker") + " i " + ti : partner + " ticked off " + (k == 1 ? "a thing" : k + " things") + " in " + ti;
        }
        show(ctx, sv, text);
    }

    void show(Context ctx, boolean sv, String text) {
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(ctx, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return;
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = ctx.getSystemService(NotificationManager.class);
            if (nm != null) nm.createNotificationChannel(new NotificationChannel(CHANNEL, sv ? "Från din partner" : "From your partner", NotificationManager.IMPORTANCE_DEFAULT));
        }
        if (text.length() > 140) text = text.substring(0, 140) + "…";
        Intent open = new Intent(ctx, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(ctx, 1, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        NotificationCompat.Builder b = new NotificationCompat.Builder(ctx, CHANNEL)
                .setSmallIcon(R.drawable.kk_notif).setContentTitle("Kalenderkoll").setContentText(text)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(text)).setColor(0xFF8A72EE)
                .setContentIntent(pi).setAutoCancel(true);
        try { NotificationManagerCompat.from(ctx).notify((int) (System.currentTimeMillis() % 100000) + 7, b.build()); } catch (SecurityException e) { /* no permission */ }
    }

    void notifyNew(Context ctx, boolean sv, String partner, List<JSONObject> fresh) {
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(ctx, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return;
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = ctx.getSystemService(NotificationManager.class);
            if (nm != null) nm.createNotificationChannel(new NotificationChannel(CHANNEL, sv ? "Från din partner" : "From your partner", NotificationManager.IMPORTANCE_DEFAULT));
        }
        String text;
        if (fresh.size() > 1) text = sv ? partner + " har lagt till " + fresh.size() + " nya saker" : partner + " added " + fresh.size() + " new things";
        else {
            JSONObject f = fresh.get(0);
            String kind = str(f, "kind");
            String n = str(f, "n"), what;
            if ("note".equals(kind)) what = (sv ? " skrev en lapp: " : " wrote a note: ") + str(f, "txt");
            else if ("memo".equals(kind)) what = (sv ? " skrev en anteckning: " : " wrote a note: ") + str(f, "ti");
            else if ("todo".equals(kind)) what = (sv ? " lade till en uppgift: " : " added a task: ") + n;
            else if ("bd".equals(kind)) what = (sv ? " lade till en speciell dag: " : " added a special day: ") + n;
            else {
                what = (sv ? " lade till: " : " added: ") + n;
                String day = str(f, "d");
                if (day.length() == 10) {
                    try {
                        Calendar c = Calendar.getInstance();
                        c.set(Integer.parseInt(day.substring(0, 4)), Integer.parseInt(day.substring(5, 7)) - 1, Integer.parseInt(day.substring(8, 10)));
                        what += " (" + new SimpleDateFormat("d MMM", sv ? new Locale("sv", "SE") : Locale.UK).format(c.getTime()).replace(".", "") + ")";
                    } catch (Exception e) { /* no date */ }
                }
            }
            text = partner + what;
        }
        if (text.length() > 140) text = text.substring(0, 140) + "…";
        Intent open = new Intent(ctx, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(ctx, 1, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        NotificationCompat.Builder b = new NotificationCompat.Builder(ctx, CHANNEL)
                .setSmallIcon(R.drawable.kk_notif).setContentTitle("Kalenderkoll").setContentText(text)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(text)).setColor(0xFF8A72EE)
                .setContentIntent(pi).setAutoCancel(true);
        try { NotificationManagerCompat.from(ctx).notify((int) (System.currentTimeMillis() % 100000), b.build()); } catch (SecurityException e) { /* no permission */ }
    }

    /* New one-off events go straight into the widget; anything else appears the next time the app is opened. */
    void addToWidget(Context ctx, List<JSONObject> fresh) {
        try {
            File wf = new File(ctx.getFilesDir(), "widget.json");
            if (!wf.exists()) return;
            JSONObject w = new JSONObject(readFile(wf));
            JSONObject days = w.optJSONObject("days");
            if (days == null) { days = new JSONObject(); w.put("days", days); }
            JSONObject cols = w.optJSONObject("cols");
            boolean changed = false;
            for (JSONObject f : fresh) {
                if (!"ev".equals(str(f, "kind"))) continue;
                String r = str(f, "r");
                if (!r.isEmpty() && !"o".equals(r)) continue;
                String d = str(f, "d"), e = str(f, "e"), t = str(f, "t"), t2 = str(f, "t2"), who = str(f, "w"), col = str(f, "col");
                if (d.length() != 10) continue;
                if (who.isEmpty()) who = "g";
                if (col.isEmpty()) col = cols != null ? cols.optString(who, "#8a72ee") : "#8a72ee";
                Calendar c = Calendar.getInstance();
                c.set(Integer.parseInt(d.substring(0, 4)), Integer.parseInt(d.substring(5, 7)) - 1, Integer.parseInt(d.substring(8, 10)), 12, 0, 0);
                for (int i = 0; i < 31; i++) {
                    String iso = WidgetProvider.iso(c);
                    if (i > 0 && (e.isEmpty() || iso.compareTo(e) > 0)) break;
                    JSONArray L = days.optJSONArray(iso);
                    if (L == null) { L = new JSONArray(); days.put(iso, L); }
                    L.put(new JSONObject().put("n", str(f, "n")).put("t", i == 0 && !t.isEmpty() ? t + (t2.isEmpty() ? "" : "–" + t2) : "").put("w", who).put("c", col));
                    changed = true;
                    c.add(Calendar.DAY_OF_MONTH, 1);
                }
            }
            if (changed) {
                writeFile(wf, w.toString());
                WidgetProvider.refreshAll(ctx);
            }
        } catch (Exception e) { /* the widget keeps what it had */ }
    }
}
