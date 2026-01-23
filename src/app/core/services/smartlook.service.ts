import { Injectable, EventEmitter, inject } from '@angular/core';
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
  private currencyService = inject(CurrencyService);

  private authService = inject(AuthService);

  private deviceService = inject(DeviceService);

  private networkService = inject(NetworkService);

  private smartlook = inject(Smartlook);

  isConnected$: Observable<boolean>;

  constructor() {
    this.setupNetworkWatcher();
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
  }

  init(): void {
    forkJoin({
      isConnected: this.isConnected$.pipe(take(1)),
      homeCurrency: this.currencyService.getHomeCurrency(),
      eou: from(this.authService.getEou()),
      deviceInfo: this.deviceService.getDeviceInfo(),
    })
      .pipe(
        filter(
          ({ isConnected, homeCurrency, eou }) =>
            isConnected && eou && !eou.us.email.includes('fyle') && homeCurrency === 'USD',
        ),
      )
      .subscribe(({ eou, deviceInfo }) => {
        this.smartlook.setProjectKey({ key: environment.SMARTLOOK_API_KEY });
        this.smartlook.start();
        this.smartlook.setUserIdentifier({ identifier: eou.us.id });
        this.smartlook.setUserProperty({ propertyName: 'id', value: eou.us.id });
        this.smartlook.setUserProperty({ propertyName: 'org_id', value: eou.ou.org_id });
        this.smartlook.setUserProperty({ propertyName: 'devicePlatform', value: deviceInfo.platform });
        this.smartlook.setUserProperty({ propertyName: 'deviceModel', value: deviceInfo.model });
        this.smartlook.setUserProperty({ propertyName: 'deviceOS', value: deviceInfo.osVersion });
        this.smartlook.setUserProperty({
          propertyName: 'is_approver',
          value: eou.ou.roles.includes('APPROVER') ? 'true' : 'false',
        });
      });
  }
}
