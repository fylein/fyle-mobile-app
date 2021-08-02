package com.ionicframework.fyle595781.staging;
import com.ahm.capacitor.camera.preview.CameraPreview;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      // Additional plugins you've installed go here
      add(CameraPreview.class);
      // Ex: add(TotallyAwesomePlugin.class);
    }});
  }
}
