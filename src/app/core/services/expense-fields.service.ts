import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, of } from 'rxjs';
import { concatMap, map, reduce, switchMap } from 'rxjs/operators';
import { DefaultTxnFieldValues } from '../models/v1/default-txn-field-values.model';
import { ExpenseField } from '../models/v1/expense-field.model';
import { ExpenseFieldsMap } from '../models/v1/expense-fields-map.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ExpenseFieldsService {
  constructor(private apiService: ApiService, private authService: AuthService) {}

  getAllEnabled(): Observable<ExpenseField[]> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.apiService.get('/expense_fields', {
          params: {
            org_id: eou.ou.org_id,
            is_enabled: true,
            is_custom: false,
          },
        })
      )
    );
  }

  formatBillableFields(expenseFields: ExpenseField[]) {
    return expenseFields.map((field) => {
      if (!field.is_custom && field.field_name.toLowerCase() === 'billable') {
        field.default_value = field.default_value === 'true';
      }
      return field;
    });
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
      map((expenseFields) => {
        const expenseFieldMap: Partial<ExpenseFieldsMap> = {};

        expenseFields = this.formatBillableFields(expenseFields);

        expenseFields.forEach((expenseField) => {
          let expenseFieldsList = [];

          if (expenseFieldMap[expenseField.column_name]) {
            expenseFieldsList = expenseFieldMap[expenseField.column_name];
          }

          expenseFieldsList.push(expenseField);
          expenseFieldMap[expenseField.column_name] = expenseFieldsList;
        });
        return expenseFieldMap;
      })
    );
  }

  getUserRoles(): Observable<string[]> {
    return from(this.authService.getRoles());
  }

  findCommonRoles(roles): Observable<string[]> {
    return this.getUserRoles().pipe(map((userRoles) => roles.filter((role) => userRoles.indexOf(role) > -1)));
  }

  canEdit(roles): Observable<boolean> {
    return this.findCommonRoles(roles).pipe(map((commonRoles) => commonRoles.length > 0));
  }

  filterByOrgCategoryId(tfcMap: any, fields: string[], orgCategory: any): Observable<Partial<ExpenseFieldsMap>> {
    const orgCategoryId = orgCategory && orgCategory.id;
    return of(fields).pipe(
      map((fields) =>
        fields
          .map((field) => {
            const configurations = tfcMap[field];
            let filteredField;

            const fieldsIndependentOfCategory = ['project_id', 'billable', 'tax_group_id', 'org_category_id'];
            const defaultFields = ['purpose', 'txn_dt', 'vendor_id', 'cost_center_id'];
            if (configurations && configurations.length > 0) {
              configurations.some((configuration) => {
                if (orgCategoryId && fieldsIndependentOfCategory.indexOf(field) < 0) {
                  if (configuration.org_category_ids && configuration.org_category_ids.indexOf(orgCategoryId) > -1) {
                    filteredField = configuration;

                    return true;
                  }
                } else if (defaultFields.indexOf(field) > -1 || fieldsIndependentOfCategory.indexOf(field) > -1) {
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
          .filter((filteredField) => !!filteredField)
      ),
      switchMap((fields) => from(fields)),
      concatMap((field) =>
        forkJoin({
          canEdit: this.canEdit(field.roles_editable),
        }).pipe(
          map((res) => ({
            ...field,
            ...res,
          }))
        )
      ),
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
