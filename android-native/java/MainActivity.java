package se.agrinders.kalenderkoll;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import com.getcapacitor.BridgeActivity;
import java.util.concurrent.TimeUnit;

/* The app itself. When you leave it, the home-screen widget is redrawn with what the app last saved. */
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        /* The check for news from your partner runs about every 15 minutes while there is internet. */
        try {
            PeriodicWorkRequest w = new PeriodicWorkRequest.Builder(BgWorker.class, 15, TimeUnit.MINUTES)
                    .setConstraints(new Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()).build();
            WorkManager.getInstance(getApplicationContext()).enqueueUniquePeriodicWork("kk_bg", ExistingPeriodicWorkPolicy.KEEP, w);
        } catch (Exception e) { /* the app works without it */ }
    }

    @Override
    public void onPause() {
        super.onPause();
        WidgetProvider.refreshAll(getApplicationContext());
        new Handler(Looper.getMainLooper()).postDelayed(() -> WidgetProvider.refreshAll(getApplicationContext()), 2500);
    }
}
