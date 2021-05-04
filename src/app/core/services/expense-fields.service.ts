import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, of } from 'rxjs';
import { concatMap, map, reduce, switchMap } from 'rxjs/operators';
import { DefaultTxnFieldValues } from '../models/v1/default-txn-field-values.model';
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
            is_enabled: true,
            is_custom: false
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
  getAllMap(): Observable<ExpenseFieldsMap> {
    return this.getAllEnabled().pipe(
      map(
        expenseFields => {
          const expenseFieldMap: ExpenseFieldsMap = {};

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

  getUserRoles(): Observable<string[]> {
    return from(this.authService.getRoles());
  }

  findCommonRoles(roles): Observable<string[]> {
    return this.getUserRoles().pipe(
      map(userRoles => roles.filter(role => {
        return userRoles.indexOf(role) > -1;
      }))
    );
  }

  canEdit(roles): Observable<boolean> {
    return this.findCommonRoles(roles).pipe(
      map(commonRoles => (commonRoles.length > 0))
    );
  }

  filterByOrgCategoryId(tfcMap: any, fields: string[], orgCategory: any): Observable<ExpenseFieldsMap> {
    const orgCategoryId = orgCategory && orgCategory.id;
    return of(fields).pipe(
      map(fields => fields.map(field => {
        let configurations = tfcMap[field];
        let filteredField;

        if (configurations && configurations.length > 0) {
          configurations.some((configuration) => {
            if (orgCategoryId) {
              if (configuration.org_category_ids && configuration.org_category_ids.indexOf(orgCategoryId) > -1) {
                filteredField = configuration;

                return true;
              }
            } else if (['purpose', 'txn_dt', 'vendor_id', 'cost_center_id'].indexOf(field) > -1) {
              filteredField = configuration;

              return true;
            }
          });
        }

        if (filteredField) {
          filteredField.field = field;
        }
        return filteredField;
      })
        .filter(filteredField => !!filteredField)
      ),
      switchMap(fields => {
        return from(fields);
      }),
      concatMap(field => {
        return forkJoin({
          canEdit: this.canEdit(field.roles_editable)
        }).pipe(
          map(
            (res) => ({
              ...field,
              ...res
            })
          )
        );
      }),
      reduce((acc, curr) => {
        acc[curr.field] = curr;
        return acc;
      }, {})
    );
  }

  getDefaultTxnFieldValues(txnFields): DefaultTxnFieldValues {
    const defaultValues = {};
    for (const configurationColumn in txnFields) {
      if (txnFields.hasOwnProperty(configurationColumn)) {
        if (txnFields[configurationColumn].default_value) {
          defaultValues[configurationColumn] = txnFields[configurationColumn].default_value;
        }
      }
    }

    return defaultValues;
  }
}
