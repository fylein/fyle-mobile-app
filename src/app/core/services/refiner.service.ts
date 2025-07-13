/* eslint-disable max-len */
import { EventEmitter, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Device } from '@capacitor/device';
import { NetworkService } from './network.service';
import { forkJoin, from, merge, Observable, of, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { map, switchMap, take } from 'rxjs/operators';
import { OrgUserService } from './org-user.service';
import { RefinerProperties } from '../models/refiner_properties.model';
import { CurrencyService } from './currency.service';
import { IdentifyUserPayload } from '../models/identify-user-payload.model';
import { TokenService } from './token.service';

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
    private orgUserService: OrgUserService,
    private tokenService: TokenService
  ) {
    this.setupNetworkWatcher();
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = merge(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
  }

  getRegion(homeCurrency: string): string {
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

  isNonDemoOrg(orgName: string): boolean {
    return !orgName.toLowerCase().includes('fyle for');
  }

  canStartSurvey(homeCurrency: string, eou: ExtendedOrgUser): Observable<boolean> {
    if (!eou?.ou?.org_name) {
      return of(false);
    }

    const isNonDemoOrg = this.isNonDemoOrg(eou.ou.org_name);
    const isSwitchedToDelegator$ = from(this.orgUserService.isSwitchedToDelegator());
    return isSwitchedToDelegator$.pipe(map((isSwitchedToDelegator) => isNonDemoOrg && !isSwitchedToDelegator));
  }

  startSurvey(properties: RefinerProperties): Observable<string | null> {
    return forkJoin({
      isConnected: this.isConnected$.pipe(take(1)),
      eou: this.authService.getEou(),
      homeCurrency: this.currencyService.getHomeCurrency(),
      deviceInfo: Device.getInfo(),
      clusterDomain: this.tokenService.getClusterDomain(),
    }).pipe(
      switchMap(({ isConnected, eou, homeCurrency, deviceInfo, clusterDomain }) => 
        this.canStartSurvey(homeCurrency, eou).pipe(
          switchMap((canStart) => {
            if (canStart && isConnected) {
              // Create a Promise that resolves when the survey is completed
              const npsPromise = new Promise<string | null>((resolve) => {
                let nps = null;
                // Set up the onComplete callback
                (window as typeof window & { _refiner: (eventName: string, payload: (formId: string, responseData: {nps: string}) => void) => void })._refiner(
                  'onComplete', 
                  function(formId, responseData) {
                    nps = responseData.nps;
                  }
                );
                (window as typeof window & { _refiner: (eventName: string, payload: (formId: string) => void) => void })._refiner('onClose', function(formId) {
                  resolve(nps);
                 });
              });

              const device = deviceInfo.operatingSystem.toUpperCase();
              
              // Identify user
              (window as typeof window & { _refiner: (eventName: string, payload: IdentifyUserPayload) => void })._refiner(
                'identifyUser',
                {
                  id: eou.us.id,
                  orgUserId: eou.ou.id,
                  orgId: eou.ou.org_id,
                  clusterDomain,
                  account: {
                    company_id: eou.ou.org_id,
                    region: `${this.getRegion(homeCurrency)} - ${homeCurrency}`,
                  },
                  source: `Mobile - ${device}`,
                  is_admin: eou?.ou?.roles?.some((role) => !['FYLER', 'APPROVER'].includes(role)) ? 'T' : 'F',
                  action_name: properties.actionName,
                }
              );

              // Set project and show form
              (window as typeof window & { _refiner: (eventName: string, payload: string) => void })._refiner(
                'setProject',
                environment.REFINER_NPS_FORM_PROJECT
              );
              (window as typeof window & { _refiner: (eventName: string, payload: string, force: boolean) => void })._refiner(
                'showForm',
                environment.REFINER_NPS_FORM_ID,
                true
              );

              // Convert Promise to Observable
              return from(npsPromise);
            }
            return of(null);
          })
        )
      )
    );
  }
}
