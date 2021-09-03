/* eslint-disable max-len */
import { EventEmitter, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Plugins } from '@capacitor/core';
import { NetworkService } from './network.service';
import { concat, forkJoin, from } from 'rxjs';
import _refiner from 'refiner-js';
import { OfflineService } from './offline.service';
import { map } from 'rxjs/operators';

const { Device } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class NpsService {
  constructor(
    private authService: AuthService,
    private offlineService: OfflineService,
    private networkService: NetworkService
  ) {}

  setupNetworkWatcher() {
    const that = this;
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    concat(that.networkService.isOnline(), networkWatcherEmitter.asObservable()).subscribe(async (isOnline) => {
      const eou = await that.authService.getEou();
      if (eou && isOnline) {
        that.initiateRefiner();
      }
    });
  }

  async getDefaultProperties() {
    const that = this;
    const eou = await that.authService.getEou();
    const properties = {
      'Admin': eou && eou.ou && eou.ou.roles && eou.ou.roles.indexOf('ADMIN') > -1 ? 'T' : 'F',
      'Lite': 'F'
    };
    properties['India / International'] = 'International Americas';
    properties['Delighted Email Subject'] = '';
    properties['Company ID'] = eou.ou.org_id;
    properties['Company Name'] = eou.ou.org_name;

    return properties;
  }

  canStartSurvey() {
    return true;
  }

  startSurvey(properties) {
    const that = this;
    const eou$ = from(that.authService.getEou());
    forkJoin({
      eou: eou$,
      homeCurrency: this.offlineService.getHomeCurrency();
    }).subscribe((res) => {
      const eou = res.eou;
      const homeCurrency = res.homeCurrency;
      if (this.canStartSurvey()) {
        let refinerProperties = this.getDefaultProperties();
        if (properties) {
          Object.assign(refinerProperties, properties);
        }
        _refiner('identifyUser', {
          id: eou.ou.id, // Replace with your user ID
          email: eou.us.email, // Replace with user Email
          name: eou.us.full_name, // Replace with user name
          properties: refinerProperties
        });

        return _refiner('showForm', '56ed8380-0c7f-11ec-89c5-effca223424b');
      }
    })
  }

  private async initiateRefiner() {
    const that = this;
    const eou = await that.authService.getEou();
    let device = '';

    const info = await Device.getInfo();

    if (info.operatingSystem === 'ios') {
      device = 'IOS';
    } else if (info.operatingSystem === 'android') {
      device = 'ANDROID';
    }

    _refiner('setProject', '56e693b0-0c7f-11ec-a9f2-b308f8f57190');

    _refiner('identifyUser', {
        id: eou.ou.id, // Replace with your user ID
        email: eou.us.email, // Replace with user Email
        name: eou.us.full_name, // Replace with user name
        device
    });
  }
}
