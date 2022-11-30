package com.ionicframework.fyle595781;

import com.getcapacitor.BridgeActivity;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {
  /*
  * Use the app font size irrespective of the user's device font settings.
  * Ref - https://forum.ionicframework.com/t/font-size-difference-caused-by-android-font-size-settings/49200/6
  */
  public void onResume() {
    super.onResume();
    WebSettings settings = bridge.getWebView().getSettings();
    settings.setTextZoom(100);
    settings.setSupportZoom(false);
  }
}
