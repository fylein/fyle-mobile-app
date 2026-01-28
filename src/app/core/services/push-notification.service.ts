import { Injectable } from '@angular/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private listenersInitialized = false;

  async initializePushNotifications(): Promise<void> {
    const permission = await PushNotifications.requestPermissions();

    if (permission.receive === 'granted') {
      this.initListeners();
      await PushNotifications.register();
    }
  }

  private initListeners(): void {
    if (this.listenersInitialized) {
      return;
    }

    this.listenersInitialized = true;

    PushNotifications.addListener('registration', (_token: Token) => {
      console.log('token', _token);
      const deviceToken = _token?.value;
      console.log('deviceToken', deviceToken);
      // TODO: Integrate API for sending token to backend
    });
    PushNotifications.addListener('registrationError', () => undefined);
    PushNotifications.addListener('pushNotificationActionPerformed', () => undefined);
  }
}

