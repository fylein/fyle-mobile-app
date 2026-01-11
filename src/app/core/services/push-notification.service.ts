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
      console.log('Push registration success, token: ' + _token.value);
    });
    PushNotifications.addListener('registrationError', () => undefined);
    PushNotifications.addListener('pushNotificationActionPerformed', () => undefined);
  }
}

