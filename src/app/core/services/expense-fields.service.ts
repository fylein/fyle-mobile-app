import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, reduce, switchMap } from 'rxjs/operators';
import { Cacheable } from 'ts-cacheable';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformExpenseField } from '../models/platform/platform-expense-field.model';
import { DefaultTxnFieldValues } from '../models/v1/default-txn-field-values.model';
import { ExpenseField } from '../models/v1/expense-field.model';
import { ExpenseFieldsMap } from '../models/v1/expense-fields-map.model';
import { ExpenseFieldsObj } from '../models/v1/expense-fields-obj.model';
import { OrgCategory } from '../models/v1/org-category.model';
import { AuthService } from './auth.service';
import { DateService } from './date.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';

@Injectable({
  providedIn: 'root',
})
export class ExpenseFieldsService {
  constructor(
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService,
    private authService: AuthService,
    private dateService: DateService,
  ) {}

  @Cacheable()
  getAllEnabled(): Observable<ExpenseField[]> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.spenderPlatformV1ApiService.get<PlatformApiResponse<PlatformExpenseField>>('/expense_fields', {
          params: {
            org_id: `eq.${eou.ou.org_id}`,
            is_enabled: 'eq.true',
            is_custom: 'eq.false',
          },
        }),
      ),
      map((res) => this.transformFrom(res.data)),
      map((res) => this.dateService.fixDates(res)),
    );
  }

  getColumnName(columnName: string, seq?: number): string {
    //Mapping of platform to legacy column name
    const columnNameMapping = {
      spent_at: 'txn_dt',
      category_id: 'org_category_id',
      merchant: 'vendor_id',
      is_billable: 'billable',
      started_at: 'from_dt',
      ended_at: 'to_dt',
      'locations[0]': 'location1',
      'locations[1]': 'location2',
    };

    //For travel class, column name depends on seq which is the key of nested object
    const travelClassMapping: {
      [key: string]: {
        [item: number]: string;
      };
    } = {
      'travel_classes[0]': {
        1: 'flight_journey_travel_class',
        2: 'bus_travel_class',
        3: 'train_travel_class',
      },
      'travel_classes[1]': {
        1: 'flight_return_travel_class',
      },
    };

    //Return the column name
    if (columnNameMapping[columnName]) {
      return columnNameMapping[columnName] as string;
    } else if (travelClassMapping[columnName] && seq !== undefined) {
      return travelClassMapping[columnName][seq];
    } else {
      return columnName;
    }
  }

  transformFrom(data: PlatformExpenseField[]): ExpenseField[] {
    return data.map((datum) => ({
      id: datum.id,
      code: datum.code,
      column_name: this.getColumnName(datum.column_name, datum.seq),
      created_at: datum.created_at,
      default_value: datum.default_value,
      field_name: datum.field_name,
      is_custom: datum.is_custom,
      is_enabled: datum.is_enabled,
      is_mandatory: datum.is_mandatory,
      options: datum.options,
      org_category_ids: datum.category_ids,
      org_id: datum.org_id,
      placeholder: datum.placeholder,
      seq: datum.seq,
      type: datum.type,
      updated_at: datum.updated_at,
      parent_field_id: datum.parent_field_id,
    }));
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
            expenseFieldsList = expenseFieldMap[expenseField.column_name] as ExpenseField[];
          }

          expenseFieldsList.push(expenseField);
          expenseFieldMap[expenseField.column_name] = expenseFieldsList;
        });
        return expenseFieldMap;
      }),
    );
  }

  filterByOrgCategoryId(
    tfcMap: Partial<ExpenseFieldsMap>,
    fields: string[],
    orgCategory: OrgCategory,
  ): Observable<Partial<ExpenseFieldsObj>> {
    const orgCategoryId = orgCategory && orgCategory.id;
    return of(fields).pipe(
      map((fields) =>
        fields
          .map((field) => {
            const configurations = tfcMap[field] as ExpenseField[];
            let filteredField: ExpenseField;

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
          .filter((filteredField) => !!filteredField),
      ),
      switchMap((fields) => from(fields)),
      map((field) => ({
        ...field,
      })),
      reduce((acc, curr) => {
        acc[curr.field] = curr;
        return acc;
      }, {}),
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
    txnFields: Partial<ExpenseFieldsMap> | Partial<ExpenseFieldsObj>,
  ): Partial<DefaultTxnFieldValues> {
    const defaultValues = {};
    for (const configurationColumn in txnFields) {
      if (txnFields.hasOwnProperty(configurationColumn)) {
        const expenseField = txnFields[configurationColumn] as ExpenseField;
        if (expenseField.default_value) {
          defaultValues[configurationColumn] = expenseField.default_value as string;
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
