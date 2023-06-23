/* eslint-disable max-len */
import { EventEmitter, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { Device } from '@capacitor/device';
import { OrgUserSettingsService } from './org-user-settings.service';
import { NetworkService } from './network.service';
import { concat } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FreshChatService {
  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private orgUserSettingsService: OrgUserSettingsService,
    private networkService: NetworkService
  ) {}

  setupNetworkWatcher() {
    const that = this;
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    concat(that.networkService.isOnline(), networkWatcherEmitter.asObservable()).subscribe(async (isOnline) => {
      const eou = await that.authService.getEou();
      if (eou && isOnline) {
        const orgUserSettings = await that.getOrgUserSettings();
        if (
          orgUserSettings &&
          orgUserSettings.in_app_chat_settings &&
          orgUserSettings.in_app_chat_settings.allowed &&
          orgUserSettings.in_app_chat_settings.enabled
        ) {
          await that.storageService.set('inAppChatRestoreId', orgUserSettings.in_app_chat_settings.restore_id);
          that.initiateCall();
        }
      }
    });
  }

  openLiveChatSupport() {
    return (window as any) && (window as any).fcWidget && (window as any).fcWidget.open();
  }

  destroy() {
    if ((window as any) && (window as any).fcWidget && (window as any).fcWidget.destroy) {
      (window as any).fcWidget.destroy();
    }
  }

  private getOrgUserSettings() {
    return this.orgUserSettingsService.get().toPromise();
  }

  private async initFreshChat() {
    const that = this;
    const eou = await that.authService.getEou();
    const inAppChatRestoreId = await that.storageService.get('inAppChatRestoreId');
    let device = '';

    const info = await Device.getInfo();

    if (info.operatingSystem === 'ios') {
      device = 'IOS';
    } else if (info.operatingSystem === 'android') {
      device = 'ANDROID';
    }

    (window as any).fcWidget.init({
      config: {
        disableNotifications: true,
      },
      token: environment.FRESHCHAT_TOKEN,
      host: 'https://wchat.in.freshchat.com',
      externalId: eou.ou.id,
      restoreId: inAppChatRestoreId, // that id is used to restore chat for the user
    });

    (window as any).fcWidget.on('widget:loaded', () => {
      if (document.getElementById('fc_frame')) {
        document.getElementById('fc_frame').style.display = 'none';
      }
    });
    (window as any).fcWidget.on('widget:closed', () => {
      if (document.getElementById('fc_frame')) {
        document.getElementById('fc_frame').style.display = 'none';
      }
    });
    (window as any).fcWidget.on('widget:opened', () => {
      if (document.getElementById('fc_frame')) {
        document.getElementById('fc_frame').style.display = 'flex';
      }
    });

    (window as any).fcWidget.user.get((resp) => {
      // Freshchat here calls an API to check if there is any user with the above externalId
      const status = resp && resp.status;
      const data = resp && resp.data;
      if (status !== 200) {
        // If there is no user with the above externalId; then set the below properties
        (window as any).fcWidget.user.setProperties({
          firstName: eou.us.full_name, // user's first name
          email: eou.us.email, // user's email address
          orgName: eou.ou.org_name, // user's org name
          orgId: eou.ou.org_id, // user's org id
          userId: eou.us.id, // user's user id
          device, // storing users device
        });
        (window as any).fcWidget.on('user:created', async (resp) => {
          // When that new user tries to initiate a chat Freshchat creates a users with above properties
          const status = resp && resp.status;
          const data = resp && resp.data;
          if (status === 200 && data.restoreId) {
            // To preserve chat history across devices and platforms, freshchat creates a unique restoreId for each user
            const orgUserSettings = await that.getOrgUserSettings();

            orgUserSettings.in_app_chat_settings.restore_id = data.restoreId; // that restoreId is stored in our db here
            await that.orgUserSettingsService.post(orgUserSettings);

            await that.storageService.set('inAppChatRestoreId', data.restoreId); // For easier access storing it in localStorage too
          }
        });
      }
    });
  }

  private initialize(document, elementId) {
    const that = this;
    let scriptElement;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    document.getElementById(elementId)
      ? that.initFreshChat.call(that)
      : (((scriptElement = document.createElement('script')).id = elementId),
        (scriptElement.async = !0),
        (scriptElement.src = 'https://wchat.in.freshchat.com/js/widget.js'),
        (scriptElement.onload = that.initFreshChat.bind(that)),
        document.head.appendChild(scriptElement));
  }

  private initiateCall() {
    this.initialize(document, 'freshchat-js-sdk');
  }
}
