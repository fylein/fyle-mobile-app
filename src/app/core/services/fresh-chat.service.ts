import { Injectable, EventEmitter } from '@angular/core';
import { OfflineService } from './offline.service';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { Plugins } from '@capacitor/core';
import { OrgUserSettingsService } from './org-user-settings.service';
import { NetworkService } from './network.service';
import { concat } from 'rxjs';
import { environment } from 'src/environments/environment';
const { Device } = Plugins;


@Injectable({
  providedIn: 'root'
})
export class FreshChatService {

  constructor(
    private offlineService: OfflineService,
    private authService: AuthService,
    private storageService: StorageService,
    private orgUserSettingsService: OrgUserSettingsService,
    private networkService: NetworkService
  ) {
    this.setupNetworkWatcher();
  }

  private setupNetworkWatcher() {
    const that = this;
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    concat(that.networkService.isOnline(), networkWatcherEmitter.asObservable()).subscribe(async (isOnline) => {
      const eou = await that.authService.getEou();
      if (eou && isOnline) {
        const orgUserSettings = await that.getOrgUserSettings();
        if (orgUserSettings && orgUserSettings.in_app_chat_settings && orgUserSettings.in_app_chat_settings.allowed && orgUserSettings.in_app_chat_settings.enabled) {
          await that.storageService.set('inAppChatRestoreId', orgUserSettings.in_app_chat_settings.restore_id);
          that.initiateCall();
        }
      }
    });
  }

  private getOrgUserSettings() {
    return this.offlineService.getOrgUserSettings().toPromise();
  }

  private async initFreshChat() {
    const that = this;
    var eou = await that.authService.getEou();
    var inAppChatRestoreId = await that.storageService.get('inAppChatRestoreId');
    var device = '';

    const info = await Device.getInfo();

    if (info.operatingSystem === 'ios') {
      device = 'IOS';
    } else if (info.operatingSystem === 'android') {
      device = 'ANDROID';
    }

    (<any>window).fcWidget.init({
      token: environment.FRESHCHAT_TOKEN,
      host: 'https://wchat.in.freshchat.com',
      externalId: eou.ou.id,
      restoreId: inAppChatRestoreId                            // that id is used to restore chat for the user
    });

    (<any>window).fcWidget.on('widget:loaded', function () {
      if (document.getElementById('fc_frame')) {
        document.getElementById('fc_frame').style.display = 'none';
      }
    });
    (<any>window).fcWidget.on('widget:closed', function () {
      if (document.getElementById('fc_frame')) {
        document.getElementById('fc_frame').style.display = 'none';
      }
    });
    (<any>window).fcWidget.on('widget:opened', function () {
      if (document.getElementById('fc_frame')) {
        document.getElementById('fc_frame').style.display = 'flex';
      }
    });

    (<any>window).fcWidget.user.get(function (resp) {                  // Freshchat here calls an API to check if there is any user with the above externalId
      var status = resp && resp.status;
      var data = resp && resp.data;
      if (status !== 200) {                                     // If there is no user with the above externalId; then set the below properties
        (<any>window).fcWidget.user.setProperties({
          firstName: eou.us.full_name,                          // user's first name
          email: eou.us.email,                                  // user's email address
          orgName: eou.ou.org_name,                             // user's org name
          orgId: eou.ou.org_id,                                 // user's org id
          userId: eou.us.id,                                    // user's user id
          device: device                                        // storing users device
        });
        (<any>window).fcWidget.on('user:created', async function (resp) {    // When that new user tries to initiate a chat Freshchat creates a users with above properties
          var status = resp && resp.status;
          var data = resp && resp.data;
          if (status === 200 && data.restoreId) {               // To preserve chat history across devices and platforms, freshchat creates a unique restoreId for each user
            const orgUserSettings = await that.getOrgUserSettings();

            orgUserSettings.in_app_chat_settings.restore_id = data.restoreId;   // that restoreId is stored in our db here
            await that.orgUserSettingsService.post(orgUserSettings)

            await that.storageService.set('inAppChatRestoreId', data.restoreId);  // For easier access storing it in localStorage too
          }
        });
      }
    });
  }

  private initialize(i, t) {
    const that = this;
    let e;
    i.getElementById(t) ? that.initFreshChat.call(that) : ((e = i.createElement('script')).id = t, e.async = !0, e.src = 'https://wchat.in.freshchat.com/js/widget.js', e.onload = that.initFreshChat.bind(that), i.head.appendChild(e));
  }

  private initiateCall() {
    this.initialize(document, 'freshchat-js-sdk');
  }

  openLiveChatSupport() {
    return (<any>window) && (<any>window).fcWidget && (<any>window).fcWidget.open();
  }
}