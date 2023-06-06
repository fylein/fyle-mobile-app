import { Injectable } from '@angular/core';
import { IonFooter } from '@ionic/angular';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { LoginInfo } from '../models/login-info.model';

@Injectable({
  providedIn: 'root',
})
export class LoginInfoService {
  constructor(private storageService: StorageService) {}

  async addLoginInfo(version: string, time: Date) {
    // login succeeded on this version at this time
    let loginInfo = await this.storageService.get<Partial<LoginInfo>>('loginInfo');

    if (!loginInfo) {
      loginInfo = {};
    }

    if (!loginInfo[version]) {
      loginInfo[version] = [];
    }

    (loginInfo[version] as Date[]).push(time);

    if (!loginInfo.lastLoggedInTime || new Date(loginInfo.lastLoggedInTime) < time) {
      loginInfo.lastLoggedInVersion = version;
      loginInfo.lastLoggedInTime = time.toUTCString();
    }

    await this.storageService.set('loginInfo', loginInfo);
  }

  getLastLoggedInVersion(): Observable<string> {
    return from(this.storageService.get<LoginInfo>('loginInfo')).pipe(
      map((loginInfo) => loginInfo?.lastLoggedInVersion)
    );
  }
}
