import { Injectable } from '@angular/core';
import { OrgSettingsService } from './org-settings.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TransactionFieldConfigurationsService {

  constructor(
    private orgSettingsService: OrgSettingsService
  ) { }

  getAll() {
    return this.orgSettingsService.get().pipe(
      map((settings) => {
        return settings.transaction_field_configurations;
      })
    );
  }

  getAllMap() {
    return this.getAll().pipe(
      map(
        transactionFieldConfigurations => {
          const tfcMap = {};

          transactionFieldConfigurations.forEach((transactionFieldConfiguration) => {
            tfcMap[transactionFieldConfiguration.column_name] = transactionFieldConfiguration.configurations;
          });

          return tfcMap;
        }
      )
    );
  }

}
