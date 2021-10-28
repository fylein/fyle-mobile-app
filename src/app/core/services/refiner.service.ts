/* eslint-disable max-len */
import { EventEmitter, Injectable } from '@angular/core';
import { OfflineService } from './offline.service';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { Plugins } from '@capacitor/core';
import { OrgUserSettingsService } from './org-user-settings.service';
import { NetworkService } from './network.service';
import { concat, forkJoin, from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { OrgUserService } from './org-user.service';
import { RefinerProperties } from '../models/refiner_properties.model';

const { Device } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class RefinerService {
  isConnected$: Observable<boolean>;

  constructor(
    private offlineService: OfflineService,
    private authService: AuthService,
    private storageService: StorageService,
    private orgUserSettingsService: OrgUserSettingsService,
    private networkService: NetworkService,
    private orgUserService: OrgUserService
  ) {
    this.setupNetworkWatcher();
  }

  setupNetworkWatcher() {
    const that = this;
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(that.networkService.isOnline(), networkWatcherEmitter.asObservable());
  }

  isNonDemoOrg(orgName: string) {
    return orgName.toLowerCase().indexOf('fyle for') === -1;
  };

  canStartSurvey(homeCurrency: string, eou: ExtendedOrgUser) {
    // const usdOrg = homeCurrency && homeCurrency === 'USD' && eou && eou.ou && eou.ou.org_name && this.isNonDemoOrg(eou.ou.org_name);
    // const isSwitchedToDelegator$ = from(this.orgUserService.isSwitchedToDelegator());
    // return isSwitchedToDelegator$.subscribe((isSwitchedToDelegator) => {
    //   return usdOrg && !isSwitchedToDelegator;
    // });
    return true;
  };

  startSurvey(properties: RefinerProperties) {
    return forkJoin({
      isConnected: this.isConnected$.pipe(take(1)),
      eou: this.authService.getEou(),
      homeCurrency: this.offlineService.getHomeCurrency(),
      deviceInfo: Device.getInfo()
    }).subscribe(({isConnected, eou, homeCurrency, deviceInfo}) => {
      if (this.canStartSurvey(homeCurrency, eou) && isConnected) {
        let device = '';
        if (deviceInfo.operatingSystem === 'ios') {
          device = 'IOS';
        } else if (deviceInfo.operatingSystem === 'android') {
          device = 'ANDROID';
        }
        (window as any)._refiner('identifyUser', {
          id: eou.us.id, // Replace with your user ID
          email: eou.us.email, // Replace with user Email
          name: eou.us.full_name, // Replace with user name
          account: {
            company_id: eou.ou.org_id,
            company_name: eou.ou.org_name,
            region: 'International Americas'
          },
          source: 'Mobile' + ' - ' + device,
          is_admin: eou && eou.ou && eou.ou.roles && eou.ou.roles.indexOf('ADMIN') > -1 ? 'T' : 'F',
          is_lite_user: 'F',
          action_name: properties['actionName']

        });
        (window as any)._refiner('showForm', environment.REFINER_NPS_FORM_ID);
      }
    });
  }
}
