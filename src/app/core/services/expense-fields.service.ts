import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, of } from 'rxjs';
import { concatMap, map, reduce, switchMap } from 'rxjs/operators';
import { PlatformExpenseFieldsData } from '../models/platform/platform-expense-fields-data.model';
import { PlatformExpenseFields } from '../models/platform/platform-expense-fields.model';
import { DefaultTxnFieldValues } from '../models/v1/default-txn-field-values.model';
import { ExpenseField } from '../models/v1/expense-field.model';
import { ExpenseFieldsMap } from '../models/v1/expense-fields-map.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { SpenderPlatformApiService } from './spender-platform-api.service';

@Injectable({
  providedIn: 'root',
})
export class ExpenseFieldsService {
  constructor(private spenderPlatformApiService: SpenderPlatformApiService, private authService: AuthService) {}

  getAllEnabled(): Observable<ExpenseField[]> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.spenderPlatformApiService
          .get('/expense_fields', {
            params: {
              org_id: 'eq.' + eou.ou.org_id,
              is_enabled: 'eq.' + true,
              is_custom: 'eq.' + false,
            },
          })
          .pipe(map((res: PlatformExpenseFields) => this.transformFrom(res.data)))
      )
    );
  }

  transformFrom(platformExpenseField: PlatformExpenseFieldsData[]): ExpenseField[] {
    let oldExpenseField = [];
    oldExpenseField = platformExpenseField.map((expenseField) => ({
      code: expenseField.code,
      column_name: expenseField.column_name,
      created_at: expenseField.created_at,
      default_value: expenseField.default_value,
      field_name: expenseField.field_name,
      id: expenseField.id,
      is_custom: expenseField.is_custom,
      is_enabled: expenseField.is_enabled,
      is_mandatory: expenseField.is_mandatory,
      options: expenseField.options,
      org_category_ids: expenseField.category_ids,
      org_id: expenseField.org_id,
      placeholder: expenseField.placeholder,
      seq: expenseField.seq,
      type: expenseField.type,
      updated_at: expenseField.updated_at,
    }));

    return oldExpenseField;
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
        console.log('check what is the res', expenseFields);
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
      // concatMap((field) =>
      //   forkJoin({
      //     canEdit: this.canEdit(field.roles_editable),
      //   }).pipe(
      //     map((res) => ({
      //       ...field,
      //       ...res,
      //     }))
      //   )
      // ),
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
