package se.agrinders.kalenderkoll;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

/* Home-screen widget: a week strip you can tap, and the chosen day split in two columns, one for each of you.
   The app writes what to show into the file widget.json; the widget only reads it. */
public class WidgetProvider extends AppWidgetProvider {
    static final String PREFS = "kk_widget";
    static final String SHIFT = "se.agrinders.kalenderkoll.W_SHIFT";
    static final String PICK = "se.agrinders.kalenderkoll.W_PICK";
    static final String TODAY = "se.agrinders.kalenderkoll.W_TODAY";
    static final int MAX_ROWS = 5;

    static String iso(Calendar c) {
        return String.format(Locale.US, "%04d-%02d-%02d", c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH));
    }

    static Calendar parse(String s) {
        Calendar c = Calendar.getInstance();
        try {
            String[] p = s.split("-");
            c.set(Integer.parseInt(p[0]), Integer.parseInt(p[1]) - 1, Integer.parseInt(p[2]), 12, 0, 0);
        } catch (Exception e) { /* keeps today */ }
        return c;
    }

    /* The chosen day. A choice made on an earlier date is forgotten, so the widget starts on today each morning. */
    static Calendar selected(Context ctx) {
        SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        Calendar now = Calendar.getInstance();
        String sel = p.getString("sel", ""), on = p.getString("on", "");
        if (sel.isEmpty() || !on.equals(iso(now))) return now;
        return parse(sel);
    }

    static void select(Context ctx, String day) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString("sel", day).putString("on", iso(Calendar.getInstance())).apply();
    }

    static JSONObject read(Context ctx) {
        try {
            File f = new File(ctx.getFilesDir(), "widget.json");
            byte[] b = new byte[(int) f.length()];
            FileInputStream in = new FileInputStream(f);
            int off = 0, n;
            while (off < b.length && (n = in.read(b, off, b.length - off)) > 0) off += n;
            in.close();
            return new JSONObject(new String(b, 0, off, StandardCharsets.UTF_8));
        } catch (Exception e) {
            return new JSONObject();
        }
    }

    static int color(String s, int fallback) {
        try { return Color.parseColor(s); } catch (Exception e) { return fallback; }
    }

    static PendingIntent act(Context ctx, String action, String arg) {
        Intent i = new Intent(ctx, WidgetProvider.class).setAction(action).setData(Uri.parse("kk://w/" + action + "/" + arg));
        return PendingIntent.getBroadcast(ctx, 0, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static RemoteViews build(Context ctx) {
        String pkg = ctx.getPackageName();
        RemoteViews rv = new RemoteViews(pkg, R.layout.kk_widget);
        JSONObject data = read(ctx);
        boolean sv = !"en".equals(data.optString("lang", "sv"));
        Locale loc = sv ? new Locale("sv", "SE") : Locale.UK;
        JSONObject days = data.optJSONObject("days");
        if (days == null) days = new JSONObject();
        JSONObject names = data.optJSONObject("names");
        JSONObject cols = data.optJSONObject("cols");
        int ink = ctx.getResources().getColor(R.color.kk_ink), soft = ctx.getResources().getColor(R.color.kk_soft),
                acc = ctx.getResources().getColor(R.color.kk_acc), red = ctx.getResources().getColor(R.color.kk_red);

        Calendar sel = selected(ctx), now = Calendar.getInstance();
        String selIso = iso(sel), todayIso = iso(now);
        rv.setTextViewText(R.id.kk_title, new SimpleDateFormat("EEE d MMM", loc).format(sel.getTime()));
        rv.setOnClickPendingIntent(R.id.kk_title, act(ctx, TODAY, "0"));
        rv.setOnClickPendingIntent(R.id.kk_prev, act(ctx, SHIFT, "-7"));
        rv.setOnClickPendingIntent(R.id.kk_next, act(ctx, SHIFT, "7"));

        /* Week strip, Monday first. */
        Calendar d = (Calendar) sel.clone();
        d.add(Calendar.DAY_OF_MONTH, -((sel.get(Calendar.DAY_OF_WEEK) + 5) % 7));
        SimpleDateFormat wd = new SimpleDateFormat("EEE", loc);
        rv.removeAllViews(R.id.kk_strip);
        for (int i = 0; i < 7; i++) {
            String di = iso(d);
            RemoteViews c = new RemoteViews(pkg, R.layout.kk_widget_day);
            c.setTextViewText(R.id.kk_dw, wd.format(d.getTime()).replace(".", ""));
            c.setTextViewText(R.id.kk_dn, String.valueOf(d.get(Calendar.DAY_OF_MONTH)));
            JSONArray L = days.optJSONArray(di);
            c.setTextViewText(R.id.kk_dp, L != null && L.length() > 0 ? "•" : " ");
            c.setTextColor(R.id.kk_dn, di.equals(todayIso) ? acc : i == 6 ? red : ink);
            c.setInt(R.id.kk_day, "setBackgroundResource", di.equals(selIso) ? R.drawable.kk_sel : 0);
            c.setOnClickPendingIntent(R.id.kk_day, act(ctx, PICK, di));
            rv.addView(R.id.kk_strip, c);
            d.add(Calendar.DAY_OF_MONTH, 1);
        }

        /* The two of you. */
        String na = names != null ? names.optString("a", "") : "", nb = names != null ? names.optString("b", "") : "";
        rv.setTextViewText(R.id.kk_na, na.isEmpty() ? (sv ? "Du" : "You") : na);
        rv.setTextViewText(R.id.kk_nb, nb.isEmpty() ? (sv ? "Din partner" : "Your partner") : nb);
        rv.setTextColor(R.id.kk_na, color(cols != null ? cols.optString("a") : "", acc));
        rv.setTextColor(R.id.kk_nb, color(cols != null ? cols.optString("b") : "", acc));

        /* The chosen day: things for both of you show in both columns. */
        rv.removeAllViews(R.id.kk_col_a);
        rv.removeAllViews(R.id.kk_col_b);
        JSONArray L = days.optJSONArray(selIso);
        int ca = 0, cb = 0, total = L == null ? 0 : L.length();
        for (int i = 0; i < total; i++) {
            JSONObject e = L.optJSONObject(i);
            if (e == null) continue;
            String w = e.optString("w", "g");
            for (int side = 0; side < 2; side++) {
                boolean mine = w.equals("g") || w.equals(side == 0 ? "a" : "b");
                if (!mine) continue;
                int count = side == 0 ? ca++ : cb++;
                if (count > MAX_ROWS) continue;
                RemoteViews it = new RemoteViews(pkg, R.layout.kk_widget_item);
                if (count == MAX_ROWS) {
                    it.setTextViewText(R.id.kk_in, sv ? "Fler…" : "More…");
                    it.setTextViewText(R.id.kk_it, "");
                    it.setInt(R.id.kk_ib, "setBackgroundColor", soft);
                } else {
                    String t = e.optString("t", "");
                    it.setTextViewText(R.id.kk_in, e.optString("n", ""));
                    it.setTextViewText(R.id.kk_it, t.isEmpty() ? (sv ? "Heldag" : "All day") : t);
                    it.setInt(R.id.kk_ib, "setBackgroundColor", color(e.optString("c"), acc));
                }
                rv.addView(side == 0 ? R.id.kk_col_a : R.id.kk_col_b, it);
            }
        }
        boolean none = ca == 0 && cb == 0;
        rv.setViewVisibility(R.id.kk_empty, none ? View.VISIBLE : View.GONE);
        rv.setTextViewText(R.id.kk_empty, data.length() == 0 ? (sv ? "Öppna Kalenderkoll en gång så fylls widgeten" : "Open Kalenderkoll once to fill the widget") : (sv ? "Inget planerat" : "Nothing planned"));

        /* Tapping the day or the plus opens the app. */
        Intent open = new Intent(ctx, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(ctx, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        rv.setOnClickPendingIntent(R.id.kk_body, pi);
        rv.setOnClickPendingIntent(R.id.kk_add, pi);
        return rv;
    }

    static void refreshAll(Context ctx) {
        try {
            AppWidgetManager m = AppWidgetManager.getInstance(ctx);
            int[] ids = m.getAppWidgetIds(new ComponentName(ctx, WidgetProvider.class));
            if (ids == null || ids.length == 0) return;
            RemoteViews rv = build(ctx);
            for (int id : ids) m.updateAppWidget(id, rv);
        } catch (Exception e) { /* a widget that cannot be drawn must never stop the app */ }
    }

    @Override
    public void onUpdate(Context ctx, AppWidgetManager m, int[] ids) {
        refreshAll(ctx);
    }

    @Override
    public void onReceive(Context ctx, Intent intent) {
        super.onReceive(ctx, intent);
        String a = intent.getAction();
        if (a == null) return;
        String arg = intent.getData() != null ? intent.getData().getLastPathSegment() : "";
        if (SHIFT.equals(a)) {
            Calendar c = selected(ctx);
            try { c.add(Calendar.DAY_OF_MONTH, Integer.parseInt(arg)); } catch (Exception e) { /* stays */ }
            select(ctx, iso(c));
            refreshAll(ctx);
        } else if (PICK.equals(a)) {
            select(ctx, arg);
            refreshAll(ctx);
        } else if (TODAY.equals(a)) {
            select(ctx, "");
            refreshAll(ctx);
        }
    }
}
