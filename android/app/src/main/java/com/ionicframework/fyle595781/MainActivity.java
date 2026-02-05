package com.ionicframework.fyle595781;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.view.View;
import com.ionicframework.fyle595781.utils.RootCheck;
import android.widget.Toast;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import androidx.core.app.NotificationManagerCompat;


public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Prevent tapjacking attacks (vapt)
    View rootView = getWindow().getDecorView().getRootView();
    rootView.setFilterTouchesWhenObscured(true);

    // Prevent rooted devices (vapt)
    RootCheck rootCheck = new RootCheck(this);
    Boolean isDeviceRooted = rootCheck.rootBeerCheck();

    if (isDeviceRooted) {
      // Show a Toast message and close the app
      Toast.makeText(this, "This application can't run on Rooted android phone", Toast.LENGTH_LONG).show();
      finish();
      return;
    }

    // Ensure a default notification channel exists for FCM on Android 8+
    createDefaultNotificationChannel();
  }

  private void createDefaultNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      String channelId = getString(R.string.default_notification_channel_id);
      String channelName = "General Notifications";
      String channelDescription = "Default notification channel";

      NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this);
      NotificationChannel existingChannel = notificationManager.getNotificationChannel(channelId);

      if (existingChannel == null) {
        NotificationChannel channel =
          new NotificationChannel(channelId, channelName, NotificationManager.IMPORTANCE_DEFAULT);
        channel.setDescription(channelDescription);
        notificationManager.createNotificationChannel(channel);
      }
  }
}
}