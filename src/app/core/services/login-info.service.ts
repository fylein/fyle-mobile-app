import { Injectable } from '@angular/core';
import { IonFooter } from '@ionic/angular';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class LoginInfoService {
  constructor(private storageService: StorageService) {}

  async addLoginInfo(version: string, time: Date) {
    // login succeeded on this version at this time
    let loginInfo = await this.storageService.get('loginInfo');

    if (!loginInfo) {
      loginInfo = {};
    }

    if (!loginInfo[version]) {
      loginInfo[version] = [];
    }

    loginInfo[version].push(time);

    if (!loginInfo.lastLoggedInTime || new Date(loginInfo.lastLoggedInTime) < time) {
      loginInfo.lastLoggedInVersion = version;
      loginInfo.lastLoggedInTime = time.toUTCString();
    }

    await this.storageService.set('loginInfo', loginInfo);
  }

  getLastLoggedInVersion(): Observable<string> {
    return from(this.storageService.get('loginInfo')).pipe(map((loginInfo) => loginInfo?.lastLoggedInVersion));
  }
}
