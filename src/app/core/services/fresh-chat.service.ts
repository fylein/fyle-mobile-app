/* eslint-disable max-len */
import { EventEmitter, Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { Device } from '@capacitor/device';
import { PlatformEmployeeSettingsService } from './platform/v1/spender/employee-settings.service';
import { NetworkService } from './network.service';
import { concat, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EmployeeSettings } from '../models/employee-settings.model';
import { FreshChatWidget } from '../models/fresh-chat-widget.model';

/* eslint-disable custom-rules/prefer-semantic-extension-name */
declare global {
  interface Window {
    fcWidget: FreshChatWidget;
  }
}

@Injectable({
  providedIn: 'root',
})
export class FreshChatService {
  private authService = inject(AuthService);

  private storageService = inject(StorageService);

  private networkService = inject(NetworkService);

  private platformEmployeeSettingsService = inject(PlatformEmployeeSettingsService);

  getWindow(): Window {
    return window;
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).subscribe(async (isOnline) => {
      const eou = await this.authService.getEou();
      if (eou && isOnline) {
        const employeeSettings = await this.getEmployeeSettings();
        if (employeeSettings?.in_app_chat_settings?.allowed && employeeSettings.in_app_chat_settings.enabled) {
          await this.storageService.set('inAppChatRestoreId', employeeSettings.in_app_chat_settings.restore_id);
          this.initiateCall();
        }
      }
    });
  }

  openLiveChatSupport(): void {
    return this.getWindow()?.fcWidget?.open();
  }

  destroy(): void {
    if (this.getWindow()?.fcWidget?.destroy) {
      this.getWindow().fcWidget.destroy();
    }
  }

  private getEmployeeSettings(): Promise<EmployeeSettings> {
    return firstValueFrom(this.platformEmployeeSettingsService.get());
  }

  private async initFreshChat(): Promise<void> {
    const eou = await this.authService.getEou();
    const inAppChatRestoreId = await this.storageService.get<string>('inAppChatRestoreId');
    let device = '';

    const info = await Device.getInfo();

    if (info.operatingSystem === 'ios') {
      device = 'IOS';
    } else if (info.operatingSystem === 'android') {
      device = 'ANDROID';
    }

    this.getWindow().fcWidget.init({
      config: {
        disableNotifications: true,
      },
      token: environment.FRESHCHAT_TOKEN,
      host: 'https://wchat.in.freshchat.com',
      externalId: eou.ou.id,
      restoreId: inAppChatRestoreId, // that id is used to restore chat for the user
    });

    this.getWindow().fcWidget.on('widget:loaded', () => {
      if (document.getElementById('fc_frame')) {
        document.getElementById('fc_frame').style.display = 'none';
      }
    });
    this.getWindow().fcWidget.on('widget:closed', () => {
      if (document.getElementById('fc_frame')) {
        document.getElementById('fc_frame').style.display = 'none';
      }
    });
    this.getWindow().fcWidget.on('widget:opened', () => {
      if (document.getElementById('fc_frame')) {
        document.getElementById('fc_frame').style.display = 'flex';
      }
    });

    this.getWindow().fcWidget.user.get((resp: { status: number; data: { restoreId: string } }) => {
      // Freshchat here calls an API to check if there is any user with the above externalId
      const status = resp && resp.status;
      if (status !== 200) {
        // If there is no user with the above externalId; then set the below properties
        this.getWindow().fcWidget.user.setProperties({
          firstName: eou.us.full_name, // user's first name
          email: eou.us.email, // user's email address
          orgName: eou.ou.org_name, // user's org name
          orgId: eou.ou.org_id, // user's org id
          userId: eou.us.id, // user's user id
          device, // storing users device
        });
        this.getWindow().fcWidget.on('user:created', async (resp: { status: number; data: { restoreId: string } }) => {
          // When that new user tries to initiate a chat Freshchat creates a users with above properties
          const status = resp && resp.status;
          const data = resp && resp.data;
          if (status === 200 && data.restoreId) {
            // To preserve chat history across devices and platforms, freshchat creates a unique restoreId for each user
            const employeeSettings = await this.getEmployeeSettings();

            employeeSettings.in_app_chat_settings.restore_id = data.restoreId; // that restoreId is stored in our db here
            await this.platformEmployeeSettingsService.post(employeeSettings);

            await this.storageService.set('inAppChatRestoreId', data.restoreId); // For easier access storing it in localStorage too
          }
        });
      }
    });
  }

  private initialize(document: Document, elementId: string): void {
    let scriptElement: HTMLScriptElement;
    if (document.getElementById(elementId)) {
      this.initFreshChat.call(this);
    } else {
      scriptElement = document.createElement('script');
      scriptElement.id = elementId;
      scriptElement.async = true;
      scriptElement.src = 'https://wchat.in.freshchat.com/js/widget.js';
      scriptElement.onload = this.initFreshChat.bind(this) as () => void;
      document.head.appendChild(scriptElement);
    }
  }

  private initiateCall(): void {
    this.initialize(document, 'freshchat-js-sdk');
  }
}
