package com.ionicframework.fyle595781;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.view.View;
import com.ionicframework.fyle595781.utils.RootCheck;
import android.widget.Toast;

public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Prevent tapjacking attacks (vapt)
    View rootView = getWindow().getDecorView().getRootView();
    rootView.setFilterTouchesWhenObscured(true);

    // // Prevent rooted devices (vapt)
    // RootCheck rootCheck = new RootCheck(this);
    // Boolean isDeviceRooted = rootCheck.rootBeerCheck();

    // if (isDeviceRooted) {
    //   // Show a Toast message and close the app
    //   Toast.makeText(this, "This application can't run on Rooted android phone", Toast.LENGTH_LONG).show();
    //   finish();
    // }
  }
}
