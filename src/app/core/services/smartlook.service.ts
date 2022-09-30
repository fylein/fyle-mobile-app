import { Injectable } from '@angular/core';
import { forkJoin, from } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { CurrencyService } from './currency.service';
import { DeviceService } from './device.service';
import {
  Smartlook,
  SmartlookSetupConfigBuilder,
  SmartlookUserIdentifier,
} from '@awesome-cordova-plugins/smartlook/ngx';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SmartlookService {
  constructor(
    private currencyService: CurrencyService,
    private authService: AuthService,
    private deviceService: DeviceService,
    private smartlook: Smartlook
  ) {}

  init() {
    forkJoin({
      homeCurrency: this.currencyService.getHomeCurrency(),
      eou: from(this.authService.getEou()),
      deviceInfo: this.deviceService.getDeviceInfo(),
    })
      .pipe(filter(({ homeCurrency, eou }) => eou && !eou.us.email.includes('fyle') && homeCurrency === 'USD'))
      .subscribe(({ eou, deviceInfo }) => {
        const setupConfig = new SmartlookSetupConfigBuilder(environment.SMARTLOOK_API_KEY);
        this.smartlook.setup(setupConfig.build());

        this.smartlook.setUserIdentifier(
          new SmartlookUserIdentifier(eou.us.id, {
            id: eou.us.id,
            email: eou.us.email,
            name: eou.us.full_name,
            org_id: eou.ou.org_id,
            org_name: eou.ou.org_name,
            devicePlatform: deviceInfo.platform,
            deviceModel: deviceInfo.model,
            deviceOS: deviceInfo.osVersion,
            is_approver: eou.ou.roles.includes('APPROVER') ? 'true' : 'false',
          })
        );
        this.smartlook.startRecording();
      });
  }
}
