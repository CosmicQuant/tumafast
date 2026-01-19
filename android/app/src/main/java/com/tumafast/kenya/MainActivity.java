package com.tumafast.kenya;

import android.os.Bundle;
import android.graphics.Color;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Make the Window edge-to-edge
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        // Explicitly set transparent colors for system bars
        Window window = getWindow();
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);

        // Ensure icons are visible on light backgrounds (requires API 26+)
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            View decorView = window.getDecorView();
            int flags = decorView.getSystemUiVisibility();
            flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR; // Dark buttons for nav bar
            flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;    // Dark icons for status bar
            decorView.setSystemUiVisibility(flags);
        }
    }
}
