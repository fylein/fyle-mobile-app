package com.ionicframework.fyle595781;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth; // Import the GoogleAuth class
public class MainActivity extends BridgeActivity {
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Register the GoogleAuth plugin
        this.registerPlugin(GoogleAuth.class);
    }
}