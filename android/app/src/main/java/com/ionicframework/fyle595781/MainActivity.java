package com.ionicframework.fyle595781;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebViewClient;
import android.webkit.WebView;
import android.webkit.SslErrorHandler;
import android.net.http.SslError;
import android.util.Log;
import org.json.JSONObject;
import org.json.JSONException;

public class MainActivity extends BridgeActivity {
  public static void enable(Bridge bridge) {
    bridge.getWebView().setWebViewClient(new BridgeWebViewClient(bridge) {
      @Override
      public void onReceivedSslError(WebView view, final SslErrorHandler handler, SslError error) {
        handler.cancel();
      }
    });
  }
}
