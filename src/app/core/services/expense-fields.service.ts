import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ExpenseField } from '../models/v1/expense-field.model';
import { ExpenseFieldsMap } from '../models/v1/expense-fields-map.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ExpenseFieldsService {

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) { }

  getAllEnabled(): Observable<ExpenseField[]> {
    return from(this.authService.getEou()).pipe(
      switchMap(eou => {
        return this.apiService.get('/expense_fields', {
          params: {
            org_id: eou.ou.org_id,
            is_enabled: true
          }
        });
      })
    )
  }

  /* getAllMap() method returns a mapping of column_names and their respective mapped fields
   * Object key: Column name
   * Object value: List of fields mapped to that particular column
   * Example: {
   *  boolean_column1: [{…}]
      bus_travel_class: [{…}]
      cost_center_id: [{…}]
      decimal_column1: [{…}]
      decimal_column10: [{…}]
      distance: (2) [{…}, {…}]
      ... }
   */
  getAllMap(): Observable<Partial<ExpenseFieldsMap>> {
    return this.getAllEnabled().pipe(
      map(
        expenseFields => {
          const expenseFieldMap: Partial<ExpenseFieldsMap> = {};

          expenseFields.forEach(expenseField => {
            let expenseFieldsList = [];

            if (expenseFieldMap[expenseField.column_name]) {
              expenseFieldsList = expenseFieldMap[expenseField.column_name];
            }

            expenseFieldsList.push(expenseField);
            expenseFieldMap[expenseField.column_name] = expenseFieldsList;
          });
          return expenseFieldMap;
        }
      )
    );
  }
}
