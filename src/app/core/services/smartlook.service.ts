import { Injectable, EventEmitter } from '@angular/core';
import { forkJoin, from, concat, Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { CurrencyService } from './currency.service';
import { DeviceService } from './device.service';
import { Smartlook } from '@awesome-cordova-plugins/smartlook/ngx';
import { environment } from 'src/environments/environment';
import { NetworkService } from './network.service';

@Injectable({
  providedIn: 'root',
})
export class SmartlookService {
  isConnected$: Observable<boolean>;

  constructor(
    private currencyService: CurrencyService,
    private authService: AuthService,
    private deviceService: DeviceService,
    private networkService: NetworkService,
    private smartlook: Smartlook
  ) {
    this.setupNetworkWatcher();
  }

  setupNetworkWatcher() {
    const that = this;
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(that.networkService.isOnline(), networkWatcherEmitter.asObservable());
  }

  init() {
    forkJoin({
      isConnected: this.isConnected$.pipe(take(1)),
      homeCurrency: this.currencyService.getHomeCurrency(),
      eou: from(this.authService.getEou()),
      deviceInfo: this.deviceService.getDeviceInfo(),
    })
      .pipe(
        filter(
          ({ isConnected, homeCurrency, eou }) =>
            isConnected && eou && !eou.us.email.includes('fyle') && homeCurrency === 'USD'
        )
      )
      .subscribe(({ eou, deviceInfo }) => {
        const projectKey: string = environment.SMARTLOOK_API_KEY;
        this.smartlook.setProjectKey({ key: projectKey });
        this.smartlook.start();

        const userProperties = {
          id: eou.us.id,
          email: eou.us.email,
          name: eou.us.full_name,
          org_id: eou.ou.org_id,
          org_name: eou.ou.org_name,
          devicePlatform: deviceInfo.platform,
          deviceModel: deviceInfo.model,
          deviceOS: deviceInfo.osVersion,
          is_approver: eou.ou.roles.includes('APPROVER') ? 'true' : 'false',
        };

        this.smartlook.setUserIdentifier({ identifier: eou.us.id });
        Object.keys(userProperties).forEach((key) => {
          this.smartlook.setUserProperty({ propertyName: key, value: userProperties[key] });
        });
      });
  }
}
