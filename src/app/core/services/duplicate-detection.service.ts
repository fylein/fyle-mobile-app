import { Injectable } from '@angular/core';
import { OfflineService } from './offline.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { switchMap, map } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { TimezoneService } from 'src/app/services/timezone.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DuplicateDetectionService {

  constructor(
    private orgUserSettingsService: OrgUserSettingsService,
    private timezoneService: TimezoneService,
    private httpClient: HttpClient
  ) { }

  getDuplicateReasons() {
    return ['Different expense', 'Other'];
  }

  post(url, data, config?) {
    return this.httpClient.post(environment.ROOT_URL + '/property_evaluator' + url, data, config).pipe(
      map((resp: any) => {
        return resp.data;
      })
    );
  }

  getPossibleDuplicates(transaction) {
    return this.orgUserSettingsService.get().pipe(
      switchMap(orgUserSettings => {
        const localeOffset = orgUserSettings.locale.offset;

        const transactionCopy = cloneDeep(transaction);

        transactionCopy.txn_dt.setHours(12);
        transactionCopy.txn_dt.setMinutes(0);
        transactionCopy.txn_dt.setSeconds(0);
        transactionCopy.txn_dt.setMilliseconds(0);
        transactionCopy.txn_dt = this.timezoneService.convertToUtc(transactionCopy.txn_dt, localeOffset);
        if (transactionCopy.to_dt) {
          transactionCopy.to_dt.setHours(12);
          transactionCopy.to_dt.setMinutes(0);
          transactionCopy.to_dt.setSeconds(0);
          transactionCopy.to_dt.setMilliseconds(0);
          transactionCopy.to_dt = this.timezoneService.convertToUtc(transactionCopy.to_dt, localeOffset);
        }
        if (transactionCopy.from_dt) {
          transactionCopy.from_dt.setHours(12);
          transactionCopy.from_dt.setMinutes(0);
          transactionCopy.from_dt.setSeconds(0);
          transactionCopy.from_dt.setMilliseconds(0);
          transactionCopy.from_dt = this.timezoneService.convertToUtc(transactionCopy.from_dt, localeOffset);
        }
        return this.post('/duplicate/test', transactionCopy);
      })
    );
  }
}
