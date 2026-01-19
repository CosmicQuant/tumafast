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
        
        // STANDARD PRO APPROACH: Fit content nicely between the bars (No overlap)
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);

        Window window = getWindow();
        
        // Set the system bars to White to blend with the app background
        window.setStatusBarColor(Color.WHITE);
        window.setNavigationBarColor(Color.WHITE);

        // Ensure the system icons (Time, Battery, Back, Home) are Dark Grey so they are visible on White
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            View decorView = window.getDecorView();
            int flags = decorView.getSystemUiVisibility();
            flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;     // Dark icons on top
            flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR; // Dark buttons on bottom
            decorView.setSystemUiVisibility(flags);
        }
    }
}
