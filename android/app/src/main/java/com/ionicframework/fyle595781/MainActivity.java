package com.ionicframework.fyle595781;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.view.View;

public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Prevent tapjacking attacks (vapt)
    View rootView = getWindow().getDecorView().getRootView();
    rootView.setFilterTouchesWhenObscured(true);
  }
}
