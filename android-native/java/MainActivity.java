package se.agrinders.kalenderkoll;

import android.os.Handler;
import android.os.Looper;
import com.getcapacitor.BridgeActivity;

/* The app itself. When you leave it, the home-screen widget is redrawn with what the app last saved. */
public class MainActivity extends BridgeActivity {
    @Override
    public void onPause() {
        super.onPause();
        WidgetProvider.refreshAll(getApplicationContext());
        new Handler(Looper.getMainLooper()).postDelayed(() -> WidgetProvider.refreshAll(getApplicationContext()), 2500);
    }
}
