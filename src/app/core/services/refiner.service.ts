/* eslint-disable max-len */
import { EventEmitter, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Device } from '@capacitor/device';
import { NetworkService } from './network.service';
import { concat, forkJoin, from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { map, take } from 'rxjs/operators';
import { OrgUserService } from './org-user.service';
import { IdentifyUserPayload, RefinerProperties } from '../models/refiner_properties.model';
import { CurrencyService } from './currency.service';

@Injectable({
  providedIn: 'root',
})
export class RefinerService {
  isConnected$: Observable<boolean>;

  americasCurrencyList = [
    'USD',
    'XCD',
    'ARS',
    'AWG',
    'BSD',
    'BBD',
    'BMD',
    'BOB',
    'BOV',
    'BRL',
    'CAD',
    'KYD',
    'CLF',
    'CLP',
    'COP',
    'COU',
    'CRC',
    'CUC',
    'CUP',
    'DOP',
    'SVC',
    'FKP',
    'GTQ',
    'GYD',
    'HTG',
    'HNL',
    'JMD',
    'MXN',
    'MXV',
    'NIO',
    'PAB',
    'PYG',
    'PEN',
    'SHP',
    'SRD',
    'TTD',
    'USN',
    'UYI',
    'UYU',
    'VEF',
  ];

  apacCurrencyList = [
    'AFN',
    'AUD',
    'BDT',
    'BTN',
    'BND',
    'KHR',
    'CNY',
    'NZD',
    'FJD',
    'HKD',
    'IDR',
    'JPY',
    'KPW',
    'KRW',
    'LAK',
    'MOP',
    'MYR',
    'MUR',
    'MNT',
    'MMK',
    'NPR',
    'PKR',
    'PGK',
    'PHP',
    'WST',
    'SGD',
    'SBD',
    'LKR',
    'TWD',
    'THB',
    'XOF',
    'TOP',
    'TMT',
    'UZS',
    'VUV',
    'VND',
    'XPF',
  ];

  europeCurrencyList = [
    'EUR',
    'ALL',
    'AMD',
    'AZN',
    'BYR',
    'BZD',
    'BAM',
    'NOK',
    'BGN',
    'HRK',
    'ANG',
    'CZK',
    'DKK',
    'XPF',
    'GEL',
    'GBP',
    'HUF',
    'ISK',
    'KZT',
    'KGS',
    'CHF',
    'MKD',
    'MDL',
    'PLN',
    'RON',
    'RUB',
    'RSD',
    'SEK',
    'CHE',
    'CHW',
    'TJS',
    'TRY',
    'UAH',
  ];

  middleEastAfricaCurrencyList = [
    'DZD',
    'AOA',
    'BHD',
    'XOF',
    'BWP',
    'BIF',
    'XAF',
    'CVE',
    'KMF',
    'CDF',
    'DJF',
    'EGP',
    'ERN',
    'ETB',
    'GMD',
    'GHS',
    'GIP',
    'GNF',
    'IRR',
    'IQD',
    'ILS',
    'JOD',
    'KES',
    'KWD',
    'LBP',
    'LSL',
    'ZAR',
    'LRD',
    'LYD',
    'MGA',
    'MWK',
    'MVR',
    'MRO',
    'XUA',
    'MAD',
    'MZN',
    'NAD',
    'NGN',
    'OMR',
    'QAR',
    'RWF',
    'STD',
    'SAR',
    'SCR',
    'SLL',
    'SOS',
    'SSP',
    'SDG',
    'SZL',
    'SYP',
    'TZS',
    'TND',
    'UGX',
    'AED',
    'YER',
    'ZMW',
    'ZWL',
  ];

  constructor(
    private currencyService: CurrencyService,
    private authService: AuthService,
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

  getRegion(homeCurrency: string) {
    if (homeCurrency === 'INR') {
      return 'India';
    } else if (this.americasCurrencyList.includes(homeCurrency)) {
      return 'International Americas';
    } else if (this.europeCurrencyList.includes(homeCurrency)) {
      return 'Europe';
    } else if (this.apacCurrencyList.includes(homeCurrency)) {
      return 'International APAC';
    } else if (this.middleEastAfricaCurrencyList.includes(homeCurrency)) {
      return 'International Africa';
    } else {
      return 'Undefined';
    }
  }

  isNonDemoOrg(orgName: string) {
    return orgName.toLowerCase().indexOf('fyle for') === -1;
  }

  canStartSurvey(homeCurrency: string, eou: ExtendedOrgUser): Observable<boolean> {
    const isNonDemoOrg = eou && eou.ou && eou.ou.org_name && this.isNonDemoOrg(eou.ou.org_name);
    const isSwitchedToDelegator$ = from(this.orgUserService.isSwitchedToDelegator());
    return isSwitchedToDelegator$.pipe(map((isSwitchedToDelegator) => isNonDemoOrg && !isSwitchedToDelegator));
  }

  startSurvey(properties: RefinerProperties) {
    return forkJoin({
      isConnected: this.isConnected$.pipe(take(1)),
      eou: this.authService.getEou(),
      homeCurrency: this.currencyService.getHomeCurrency(),
      deviceInfo: Device.getInfo(),
    }).subscribe(({ isConnected, eou, homeCurrency, deviceInfo }) => {
      if (this.canStartSurvey(homeCurrency, eou) && isConnected) {
        let device = '';
        if (deviceInfo.operatingSystem === 'ios') {
          device = 'IOS';
        } else if (deviceInfo.operatingSystem === 'android') {
          device = 'ANDROID';
        }
        (window as typeof window & { _refiner: (eventName: string, payload: IdentifyUserPayload) => void })._refiner(
          'identifyUser',
          {
            id: eou.us.id, // Replace with your user ID
            email: eou.us.email, // Replace with user Email
            name: eou.us.full_name, // Replace with user name
            account: {
              company_id: eou.ou.org_id,
              company_name: eou.ou.org_name,
              region: this.getRegion(homeCurrency) + ' - ' + homeCurrency,
            },
            source: 'Mobile' + ' - ' + device,
            is_admin: eou && eou.ou && eou.ou.roles && eou.ou.roles.indexOf('ADMIN') > -1 ? 'T' : 'F',
            action_name: properties.actionName,
          }
        );
        (window as typeof window & { _refiner: (eventName: string, payload: string) => void })._refiner(
          'showForm',
          environment.REFINER_NPS_FORM_ID
        );
      }
    });
  }
}
