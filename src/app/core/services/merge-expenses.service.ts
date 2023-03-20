import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { concatMap, filter, map, mergeMap, reduce, shareReplay, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Expense } from '../models/expense.model';
import { ExpensesInfo } from './expenses-info.model';
import { FileService } from './file.service';
import { CorporateCreditCardExpenseService } from './corporate-credit-card-expense.service';
import * as dayjs from 'dayjs';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { ProjectsService } from './projects.service';
import { CategoriesService } from './categories.service';
import { FileObject } from '../models/file-obj.model';
import { CorporateCardExpense } from '../models/v2/corporate-card-expense.model';
import { FormControl } from '@angular/forms';
import { DateService } from './date.service';
import { AccountType } from '../enums/account-type.enum';
import { TaxGroupService } from './tax-group.service';
import { CustomInputsService } from './custom-inputs.service';
import { cloneDeep } from 'lodash';
import { CustomProperty } from '../models/custom-properties.model';
import { TxnCustomProperties } from '../models/txn-custom-properties.model';
import { MergeExpensesOption } from '../models/merge-expenses-option.model';
import { MergeExpensesOptionsData } from '../models/merge-expenses-options-data.model';

type CustomInputs = Partial<{
  control: FormControl;
  id: number;
  mandatory: boolean;
  name: string;
  options: string[];
  placeholder: string;
  prefix: string;
  type: string;
  value: string;
}>;

type mergeFormValues = {
  [key: string]: any;
};

@Injectable({
  providedIn: 'root',
})
export class MergeExpensesService {
  constructor(
    private apiService: ApiService,
    private fileService: FileService,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private customInputsService: CustomInputsService,
    private humanizeCurrency: HumanizeCurrencyPipe,
    private projectService: ProjectsService,
    private categoriesService: CategoriesService,
    private dateService: DateService,
    private taxGroupService: TaxGroupService
  ) {}

  mergeExpenses(sourceTxnIds: string[], targetTxnId: string, targetTxnFields: mergeFormValues): Observable<string> {
    return this.apiService.post('/transactions/merge', {
      source_txn_ids: sourceTxnIds,
      target_txn_id: targetTxnId,
      target_txn_fields: targetTxnFields,
    });
  }

  isAllAdvanceExpenses(expenses: Expense[]): boolean {
    return expenses.every((expense) => expense?.source_account_type === AccountType.ADVANCE);
  }

  checkIfAdvanceExpensePresent(expenses: Expense[]): Expense[] {
    return expenses.filter((expense) => expense?.source_account_type === AccountType.ADVANCE);
  }

  setDefaultExpenseToKeep(expenses: Expense[]): ExpensesInfo {
    const advanceExpenses = this.checkIfAdvanceExpensePresent(expenses);
    const reportedAndAboveExpenses = expenses.filter((expense) =>
      ['APPROVER_PENDING', 'APPROVED', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'].includes(expense.tx_state)
    );
    const expensesInfo: ExpensesInfo = {
      isReportedAndAbove: reportedAndAboveExpenses.length > 0,
      isAdvancePresent: advanceExpenses?.length > 0,
      defaultExpenses: [],
    };
    if (reportedAndAboveExpenses.length > 0) {
      expensesInfo.defaultExpenses = reportedAndAboveExpenses;
    } else if (advanceExpenses?.length > 0) {
      expensesInfo.defaultExpenses = advanceExpenses;
    } else {
      expensesInfo.defaultExpenses = null;
    }
    return expensesInfo;
  }

  isApprovedAndAbove(expenses: Expense[]): Expense[] {
    const approvedAndAboveExpenses = expenses.filter((expense) =>
      ['APPROVED', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'].includes(expense.tx_state)
    );
    return approvedAndAboveExpenses;
  }

  isAdvancePresent(expensesInfo: ExpensesInfo): boolean {
    return expensesInfo.defaultExpenses?.length === 1 && expensesInfo.isAdvancePresent;
  }

  isReportedPresent(expenses: Expense[]): Expense[] {
    return expenses.filter((expense) => expense.tx_state === 'APPROVER_PENDING');
  }

  isMoreThanOneAdvancePresent(expensesInfo: ExpensesInfo, isAllAdvanceExpenses: boolean): boolean {
    return expensesInfo.defaultExpenses?.length > 1 && isAllAdvanceExpenses && expensesInfo.isAdvancePresent;
  }

  isReportedOrAbove(expensesInfo: ExpensesInfo): boolean {
    return expensesInfo.defaultExpenses?.length === 1 && expensesInfo.isReportedAndAbove;
  }

  getAttachements(txnID: string): Observable<FileObject[]> {
    return this.fileService.findByTransactionId(txnID).pipe(
      switchMap((fileObjs) => from(fileObjs)),
      concatMap((fileObj: any) =>
        this.fileService.downloadUrl(fileObj.id).pipe(
          map((downloadUrl) => {
            fileObj.url = downloadUrl;
            const details = this.fileService.getReceiptsDetails(fileObj);
            fileObj.type = details.type;
            fileObj.thumbnail = details.thumbnail;
            return fileObj;
          })
        )
      ),
      reduce((acc, curr) => acc.concat(curr), [])
    );
  }

  getCorporateCardTransactions(expenses: Expense[]): Observable<CorporateCardExpense[]> {
    return this.customInputsService.getAll(true).pipe(
      switchMap(() => {
        const CCCGroupIds = expenses.map((expense) => expense?.tx_corporate_credit_card_expense_group_id);

        if (CCCGroupIds?.length > 0) {
          const queryParams = {
            group_id: ['in.(' + CCCGroupIds + ')'],
          };
          const params: any = {};
          params.queryParams = queryParams;
          params.offset = 0;
          params.limit = 1;
          return this.corporateCreditCardExpenseService
            .getv2CardTransactions(params)
            .pipe(map((cardTxns) => cardTxns.data));
        } else {
          return of([]);
        }
      })
    );
  }

  generateExpenseToKeepOptions(expenses: Expense[]): Observable<MergeExpensesOption[]> {
    return from(expenses).pipe(
      map((expense) => {
        let vendorOrCategory = '';
        if (expense.tx_org_category) {
          vendorOrCategory = expense.tx_org_category;
        }
        if (expense.tx_vendor) {
          vendorOrCategory = expense.tx_vendor;
        }
        let projectName = '';
        if (expense.tx_project_name) {
          projectName = `- ${expense.tx_project_name}`;
        }

        let date = '';
        if (expense.tx_txn_dt) {
          date = dayjs(expense.tx_txn_dt).format('MMM DD');
        }
        let amount = this.humanizeCurrency.transform(expense.tx_amount, expense.tx_currency);
        if (!date) {
          amount = '';
        }
        return {
          label: `${date} ${amount} ${vendorOrCategory} ${projectName}`,
          value: expense.tx_id,
        };
      }),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      shareReplay(1)
    );
  }

  generateReceiptOptions(expenses: Expense[]): Observable<MergeExpensesOption[]> {
    return from(expenses).pipe(
      map((expense, index) => ({
        label: `Receipt From Expense ${index + 1} `,
        value: expense.tx_id,
      })),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, [])
    );
  }

  generateAmountOptions(expenses: Expense[]): Observable<MergeExpensesOptionsData> {
    return from(expenses).pipe(
      map((expense) => {
        const isForeignAmountPresent = expense.tx_orig_currency && expense.tx_orig_amount;
        let formatedlabel;
        if (isForeignAmountPresent) {
          formatedlabel =
            expense.tx_orig_currency +
            ' ' +
            expense.tx_orig_amount +
            '  (' +
            expense.tx_currency +
            ' ' +
            expense.tx_amount +
            ')';
        } else {
          formatedlabel = expense.tx_currency + ' ' + expense.tx_amount;
        }
        if (!expense.tx_amount) {
          formatedlabel = '0';
        }
        return {
          label: formatedlabel,
          value: expense.tx_id,
        };
      }),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: MergeExpensesOption[]) => {
        const optionLabels = options.map((option) => option.label);
        return {
          options,
          areSameValues: this.checkOptionsAreSame(optionLabels),
        };
      })
    );
  }

  generateDateOfSpendOptions(expenses: Expense[]): Observable<MergeExpensesOptionsData> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_txn_dt !== null),
      map((expense) => ({
        label: dayjs(expense.tx_txn_dt).format('MMM DD, YYYY'),
        value: expense.tx_txn_dt,
      })),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: MergeExpensesOption[]) => {
        const optionValues = options.map((option) => dayjs(option.value).format('YYYY-MM-DD'));
        return {
          options,
          areSameValues: this.checkOptionsAreSame(optionValues),
        };
      })
    );
  }

  generatePaymentModeOptions(expenses: Expense[]): Observable<MergeExpensesOptionsData> {
    return from(expenses).pipe(
      map((expense) => ({
        label: expense.source_account_type,
        value: expense.source_account_type,
      })),
      map((option) => this.formatPaymentModeOptions(option)),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: MergeExpensesOption[]) => this.formatOptions(options))
    );
  }

  generateVendorOptions(expenses: Expense[]): Observable<MergeExpensesOptionsData> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_vendor),
      map((expense) => ({
        label: expense.tx_vendor?.toString(),
        value: expense.tx_vendor,
      })),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: MergeExpensesOption[]) => this.formatOptions(options))
    );
  }

  generateProjectOptions(expenses: Expense[]): Observable<MergeExpensesOptionsData> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_project_id),
      map((expense) => ({
        label: expense.tx_project_id,
        value: expense.tx_project_id,
      })),
      mergeMap((option) => this.formatProjectOptions(option)),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: MergeExpensesOption[]) => this.formatOptions(options))
    );
  }

  generateCategoryOptions(expenses: Expense[]): Observable<MergeExpensesOptionsData> {
    return from(expenses).pipe(
      map((expense) => ({
        label: '',
        value: expense.tx_org_category_id,
      })),
      mergeMap((option) => this.formatCategoryOption(option)),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: MergeExpensesOption[]) => {
        const optionValues = options.map((option) => option.value);
        return {
          options: this.removeUnspecified(options),
          areSameValues: this.checkOptionsAreSame(optionValues),
        };
      })
    );
  }

  generateTaxGroupOptions(expenses: Expense[]): Observable<MergeExpensesOptionsData> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_tax_group_id !== null),
      map((expense) => ({
        label: expense.tx_tax_group_id,
        value: expense.tx_tax_group_id,
      })),
      mergeMap((option) => this.formatTaxGroupOption(option)),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: MergeExpensesOption[]) => this.formatOptions(options))
    );
  }

  generateTaxAmountOptions(expenses: Expense[]): Observable<MergeExpensesOptionsData> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_tax !== null),
      map((expense) => ({
        label: expense.tx_tax.toString(),
        value: expense.tx_tax,
      })),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: MergeExpensesOption[]) => this.formatOptions(options))
    );
  }

  generateCostCenterOptions(expenses: Expense[]): Observable<MergeExpensesOptionsData> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_cost_center_name !== null),
      map((expense) => ({
        label: expense.tx_cost_center_name.toString(),
        value: expense.tx_cost_center_name,
      })),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: MergeExpensesOption[]) => this.formatOptions(options))
    );
  }

  generatePurposeOptions(expenses: Expense[]): Observable<MergeExpensesOptionsData> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_purpose !== null),
      map((expense) => ({
        label: expense.tx_purpose.toString(),
        value: expense.tx_purpose,
      })),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: MergeExpensesOption[]) => this.formatOptions(options))
    );
  }

  generateLocationOptions(expenses: Expense[], locationIndex: number): Observable<MergeExpensesOptionsData> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_locations[locationIndex]),
      map((expense) => ({
        label: expense.tx_locations[locationIndex]?.formatted_address,
        value: expense.tx_locations[locationIndex],
      })),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: MergeExpensesOption[]) => {
        const optionLabels = options.map((option) => option.label);
        return {
          options,
          areSameValues: this.checkOptionsAreSame(optionLabels),
        };
      })
    );
  }

  generateOnwardDateOptions(expenses: Expense[]): Observable<MergeExpensesOptionsData> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_from_dt !== null),
      map((expense) => ({
        label: dayjs(expense.tx_from_dt).format('MMM DD, YYYY'),
        value: expense.tx_from_dt,
      })),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: MergeExpensesOption[]) => {
        const optionValues = options.map((option) => dayjs(option.value).format('YYYY-MM-DD'));
        return {
          options,
          areSameValues: this.checkOptionsAreSame(optionValues),
        };
      })
    );
  }

  generateReturnDateOptions(expenses: Expense[]): Observable<MergeExpensesOptionsData> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_to_dt !== null),
      map((expense) => ({
        label: dayjs(expense.tx_to_dt).format('MMM DD, YYYY'),
        value: expense.tx_to_dt,
      })),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: MergeExpensesOption[]) => {
        const optionValues = options.map((option) => dayjs(option.value).format('YYYY-MM-DD'));
        return {
          options,
          areSameValues: this.checkOptionsAreSame(optionValues),
        };
      })
    );
  }

  generateFlightJourneyTravelClassOptions(expenses: Expense[]): Observable<MergeExpensesOptionsData> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_flight_journey_travel_class !== null),
      map((expense) => ({
        label: expense.tx_flight_journey_travel_class.toString(),
        value: expense.tx_flight_journey_travel_class,
      })),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: MergeExpensesOption[]) => this.formatOptions(options))
    );
  }

  generateFlightReturnTravelClassOptions(expenses: Expense[]): Observable<MergeExpensesOptionsData> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_flight_return_travel_class !== null),
      map((expense) => ({
        label: expense.tx_flight_return_travel_class.toString(),
        value: expense.tx_flight_return_travel_class,
      })),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: MergeExpensesOption[]) => this.formatOptions(options))
    );
  }

  generateTrainTravelClassOptions(expenses: Expense[]): Observable<MergeExpensesOptionsData> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_train_travel_class !== null),
      map((expense) => ({
        label: expense.tx_train_travel_class.toString(),
        value: expense.tx_train_travel_class,
      })),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: MergeExpensesOption[]) => this.formatOptions(options))
    );
  }

  generateBusTravelClassOptions(expenses: Expense[]): Observable<MergeExpensesOptionsData> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_bus_travel_class !== null),
      map((expense) => ({
        label: expense.tx_bus_travel_class.toString(),
        value: expense.tx_bus_travel_class,
      })),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: MergeExpensesOption[]) => this.formatOptions(options))
    );
  }

  generateDistanceOptions(expenses: Expense[]): Observable<MergeExpensesOptionsData> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_distance !== null),
      map((expense) => ({
        label: expense.tx_distance.toString(),
        value: expense.tx_distance,
      })),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: MergeExpensesOption[]) => this.formatOptions(options))
    );
  }

  generateDistanceUnitOptions(expenses: Expense[]): Observable<MergeExpensesOptionsData> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_distance_unit !== null),
      map((expense) => ({
        label: expense.tx_distance_unit.toString(),
        value: expense.tx_distance_unit,
      })),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: MergeExpensesOption[]) => this.formatOptions(options))
    );
  }

  generateBillableOptions(expenses: Expense[]): Observable<MergeExpensesOptionsData> {
    return from(expenses).pipe(
      map((expense) => ({
        label: expense.tx_billable.toString(),
        value: expense.tx_billable,
      })),
      map((option) => this.formatBillableOptions(option)),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: MergeExpensesOption[]) => this.formatOptions(options))
    );
  }

  getCategoryName(categoryId: string): Observable<string> {
    return this.categoriesService.getAll().pipe(
      map((categories) => {
        const category = categories.find((category) => category?.id?.toString() === categoryId);
        return category?.name;
      })
    );
  }

  getCustomInputValues(expenses: Expense[]): CustomInputs[] {
    //Create a copy so that we don't modify the expense object
    const expensesCopy = cloneDeep(expenses);
    return expensesCopy
      .map((expense) => {
        if (expense.tx_custom_properties !== null && expense.tx_custom_properties.length > 0) {
          return expense.tx_custom_properties;
        }
      })
      .filter((element) => element !== undefined);
  }

  getProjectDependentFieldsMapping(
    expenses: Expense[],
    dependentFields: TxnCustomProperties[]
  ): {
    [projectId: number]: CustomProperty<string>[];
  } {
    const projectDependentFieldsMapping = {};
    expenses.forEach((expense) => {
      const txDependentFields: CustomProperty<string>[] = dependentFields
        ?.map((dependentField: TxnCustomProperties) =>
          expense.tx_custom_properties.find(
            (txCustomProperty: CustomProperty<string>) => dependentField.name === txCustomProperty.name
          )
        )
        .filter((txDependentField) => !!txDependentField);

      const dependentFieldsForProject = projectDependentFieldsMapping[expense.tx_project_id];

      //If both the expenses have same project id but first one does not have any dependent field
      //then use the dependent fields from the second expense, else use fields from first expense
      if (!dependentFieldsForProject || dependentFieldsForProject.length === 0) {
        projectDependentFieldsMapping[expense.tx_project_id] = txDependentFields || [];
      }
    });
    return projectDependentFieldsMapping;
  }

  formatCustomInputOptions(combinedCustomProperties: MergeExpensesOptionsData[]) {
    const customProperty = this.formatCustomInputOptionsByType(combinedCustomProperties);
    return customProperty
      .map((field) => {
        let options;
        if (field.options) {
          options = field.options.filter((option) => option !== null && option !== '');
          const values = options.map((item) => item.label);

          const isDuplicate = values.some((item, index) => values.indexOf(item) !== index);

          field.areSameValues = isDuplicate;
          field.options = options;
        } else {
          field.options = [];
        }
        return field;
      })
      .reduce((obj, field) => {
        obj[field.name] = field;
        return obj;
      }, {});
  }

  getFieldValue(optionsData: MergeExpensesOptionsData) {
    if (optionsData?.areSameValues) {
      return optionsData?.options[0]?.value;
    } else {
      return null;
    }
  }

  getFieldValueOnChange(
    optionsData: MergeExpensesOptionsData,
    isTouched: boolean,
    selectedExpenseValue: any,
    formValue: any
  ) {
    if (!optionsData?.areSameValues && !isTouched) {
      return selectedExpenseValue;
    } else {
      return formValue;
    }
  }

  // Value can be anything: string | number | date | list | userlist
  setFormattedDate(value: any): string {
    return dayjs(value).format('MMM DD, YYYY');
  }

  private formatCustomInputOptionsByType(combinedCustomProperties: MergeExpensesOptionsData[]) {
    const customProperty = [];

    combinedCustomProperties.forEach((field) => {
      const existing = customProperty.find((option) => option.name === field.name);
      if (field.value) {
        let formatedlabel;
        const isValidDate = this.dateService.isValidDate(field.value);
        if (isValidDate) {
          formatedlabel = this.setFormattedDate(field.value);
        } else {
          formatedlabel = field.value.toString();
        }
        if (existing) {
          const existingIndex = customProperty.indexOf(existing);
          if (
            typeof customProperty[existingIndex].value === 'string' ||
            typeof customProperty[existingIndex].value === 'number'
          ) {
            customProperty[existingIndex].options.push({ label: formatedlabel, value: field.value });
          } else {
            customProperty[existingIndex].options = customProperty[existingIndex].options.concat(field.options);
          }
        } else {
          field.options = [];
          field.options.push({ label: formatedlabel, value: field.value });
          customProperty.push(field);
        }
      }
    });
    return customProperty;
  }

  private removeUnspecified(options: MergeExpensesOption[]): MergeExpensesOption[] {
    return options.filter(
      (option, index, options) => options.findIndex((currentOption) => currentOption.label === option.label) === index
    );
  }

  private checkOptionsAreSame(options): boolean {
    return options.some((field, index) => options.indexOf(field) !== index);
  }

  private formatOptions(options: MergeExpensesOption[]): MergeExpensesOptionsData {
    const optionValues = options.map((option) => option.value);
    return {
      options,
      areSameValues: this.checkOptionsAreSame(optionValues),
    };
  }

  private formatTaxGroupOption(option: MergeExpensesOption): Observable<MergeExpensesOptionsData> {
    const taxGroups$ = this.taxGroupService.get().pipe(shareReplay(1));

    return taxGroups$.pipe(
      map((taxGroups) => {
        option.label = taxGroups[taxGroups.map((taxGroup) => taxGroup.id).indexOf(option.value)]?.name;
        return option;
      })
    );
  }

  private formatCategoryOption(option: MergeExpensesOption): Observable<MergeExpensesOption> {
    const allCategories$ = this.categoriesService.getAll();

    return allCategories$.pipe(
      map((catogories) => this.categoriesService.filterRequired(catogories)),
      map((categories) => {
        option.label = categories[categories.map((category) => category.id).indexOf(option.value)]?.displayName;
        if (!option.label) {
          option.label = 'Unspecified';
        }
        return option;
      })
    );
  }

  private formatProjectOptions(option: MergeExpensesOption): Observable<MergeExpensesOption> {
    const projects$ = this.projectService.getAllActive().pipe(shareReplay(1));
    return projects$.pipe(
      map((projects) => {
        const index = projects.map((project) => project.id).indexOf(option.value);
        option.label = projects[index]?.name;
        return option;
      })
    );
  }

  private formatBillableOptions(option: MergeExpensesOption): MergeExpensesOption {
    if (option.value === true) {
      option.label = 'Yes';
    } else {
      option.label = 'No';
    }
    return option;
  }

  private formatPaymentModeOptions(option: MergeExpensesOption): MergeExpensesOption {
    if (option.value === AccountType.CCC) {
      option.label = 'Corporate Card';
    } else if (option.value === AccountType.PERSONAL) {
      option.label = 'Personal Card/Cash';
    } else if (option.value === AccountType.ADVANCE) {
      option.label = 'Advance';
    }
    return option;
  }
}
