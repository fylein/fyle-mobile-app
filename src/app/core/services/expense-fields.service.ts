import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, reduce, switchMap } from 'rxjs/operators';
import { Cacheable } from 'ts-cacheable';
import { DefaultTxnFieldValues } from '../models/v1/default-txn-field-values.model';
import { ExpenseField } from '../models/v1/expense-field.model';
import { ExpenseFieldsMap } from '../models/v1/expense-fields-map.model';
import { ExpenseFieldsObj } from '../models/v1/expense-fields-obj.model';
import { OrgCategory } from '../models/v1/org-category.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { DateService } from './date.service';

@Injectable({
  providedIn: 'root',
})
export class ExpenseFieldsService {
  constructor(private apiService: ApiService, private authService: AuthService, private dateService: DateService) {}

  @Cacheable()
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
      ),
      map((res) => this.dateService.fixDates(res))
    );
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

  filterByOrgCategoryId(
    tfcMap: Partial<ExpenseFieldsMap>,
    fields: string[],
    orgCategory: OrgCategory
  ): Observable<Partial<ExpenseFieldsMap | ExpenseFieldsObj>> {
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
      map((field) => ({
        ...field,
      })),
      reduce((acc, curr) => {
        acc[curr.field] = curr;
        return acc;
      }, {})
    );
  }

  /* TODO: txnFields should be of one type, handle inconsistency in forms
      There are 3 types of responses here:
      1st type, expense field -> {column_name, id..} etc
      2nd type, expense field obj -> {purpose: {}, txn_dt: {}……}
      3rd type, expense field map -> {purpose: [{}], txn_dt: [{}, {},…]….}
      Till date the type was any, so this issue didn't come up,
      This is wrong, all our expense forms pages expects the results as expense field map, but, before that, we filter these by org category, so the response changes to expense field obj
      To handle both case added this, it can take the type based on use case, but, ideally, we should have a single type of response
  */
  getDefaultTxnFieldValues(
    txnFields: Partial<ExpenseFieldsMap> | Partial<ExpenseFieldsObj>
  ): Partial<DefaultTxnFieldValues> {
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

  private formatBillableFields(expenseFields: ExpenseField[]): ExpenseField[] {
    return expenseFields.map((field) => {
      if (!field.is_custom && field.field_name.toLowerCase() === 'billable') {
        field.default_value = field.default_value === 'true';
      }
      return field;
    });
  }
}
