import { Injectable } from '@angular/core';
import { from, Observable, of, Subject } from 'rxjs';
import { concatMap, filter, map, mergeMap, reduce, shareReplay, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Expense } from '../models/expense.model';
import { ExpensesInfo } from './expenses-info.model';
import { FileService } from './file.service';
import { CorporateCreditCardExpenseService } from './corporate-credit-card-expense.service';
import { OfflineService } from './offline.service';
import * as moment from 'moment';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { ProjectsService } from './projects.service';
import { CategoriesService } from './categories.service';
import { FileObject } from '../models/file_obj.model';
import { FileResponse } from './file-response.model';
import { CorporateCardExpense } from '../models/v2/corporate-card-expense.model';
import { FormControl } from '@angular/forms';
import { DateService } from './date.service';

type Option = Partial<{
  label: string;
  value: any;
}>;

type OptionsData = Partial<{
  options: Option[];
  areSameValues: boolean;
  name: string;
  value: any;
}>;

type CustomInputs = Partial<{
  control: FormControl;
  id: string;
  mandatory: boolean;
  name: string;
  options: Option[];
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
    private offlineService: OfflineService,
    private humanizeCurrency: HumanizeCurrencyPipe,
    private projectService: ProjectsService,
    private categoriesService: CategoriesService,
    private dateService: DateService
  ) {}

  mergeExpenses(sourceTxnIds: string[], targetTxnId: string, targetTxnFields: mergeFormValues): Observable<string> {
    return this.apiService.post('/transactions/merge', {
      source_txn_ids: sourceTxnIds,
      target_txn_id: targetTxnId,
      target_txn_fields: targetTxnFields,
    });
  }

  isAllAdvanceExpenses(expenses: Expense[]): boolean {
    return expenses.every((expense) => expense?.source_account_type === 'PERSONAL_ADVANCE_ACCOUNT');
  }

  checkIfAdvanceExpensePresent(expenses: Expense[]): Expense[] {
    return expenses.filter((expense) => expense?.source_account_type === 'PERSONAL_ADVANCE_ACCOUNT');
  }

  setDefaultExpenseToKeep(expenses: Expense[]): ExpensesInfo {
    const advanceExpenses = this.checkIfAdvanceExpensePresent(expenses);
    const reportedAndAboveExpenses = expenses.filter((expense) =>
      ['APPROVER_PENDING', 'APPROVED', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'].includes(expense.tx_state)
    );
    const expensesInfo: ExpensesInfo = {
      isReportedAndAbove: reportedAndAboveExpenses?.length > 0,
      isAdvancePresent: advanceExpenses?.length > 0,
      defaultExpenses: [],
    };
    if (reportedAndAboveExpenses?.length > 0) {
      expensesInfo.defaultExpenses = reportedAndAboveExpenses;
    } else if (advanceExpenses?.length > 0) {
      expensesInfo.defaultExpenses = advanceExpenses;
    } else {
      expensesInfo.defaultExpenses = null;
    }
    return expensesInfo;
  }

  getReceiptDetails(file: FileObject): FileResponse {
    const extension = this.getReceiptExtension(file.name);
    const fileResponse = {
      type: 'unknown',
      thumbnail: 'img/fy-receipt.svg',
    };

    if (extension.endsWith('.pdf')) {
      fileResponse.type = 'pdf';
      fileResponse.thumbnail = 'img/fy-pdf.svg';
    } else if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) {
      fileResponse.type = 'image';
      fileResponse.thumbnail = file.url;
    }
    return fileResponse;
  }

  getReceiptExtension(name: string): string {
    let extension = null;

    if (name) {
      const filename = name.toLowerCase();
      const index = filename.lastIndexOf('.');

      if (index > -1) {
        extension = filename.substring(index + 1, filename.length);
      }
    }
    return extension;
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
            const details = this.getReceiptDetails(fileObj);
            fileObj.type = details.type;
            fileObj.thumbnail = details.thumbnail;
            return fileObj;
          })
        )
      ),
      reduce((acc, curr) => acc.concat(curr), [])
    );
  }

  getCardCardTransactions(expenses: Expense[]): Observable<CorporateCardExpense[]> {
    return this.offlineService.getCustomInputs().pipe(
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

  generateExpenseToKeepOptions(expenses: Expense[]): Observable<Option[]> {
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
          date = moment(expense.tx_txn_dt).format('MMM DD');
        }
        let amount = this.humanizeCurrency.transform(expense.tx_amount, expense.tx_currency, 2);
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

  generateReceiptOptions(expenses: Expense[]): Observable<Option[]> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_file_ids !== null),
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

  checkOptionsAreSame(options): boolean {
    return options.some((field, index) => options.indexOf(field) !== index);
  }

  generateAmountOptions(expenses: Expense[]): Observable<OptionsData> {
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
      map((options: Option[]) => {
        const optionLabels = options.map((option) => option.label);
        return {
          options,
          areSameValues: this.checkOptionsAreSame(optionLabels),
        };
      })
    );
  }

  generateDateOfSpendOptions(expenses: Expense[]): Observable<OptionsData> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_txn_dt !== null),
      map((expense) => ({
        label: moment(expense.tx_txn_dt).format('MMM DD, YYYY'),
        value: expense.tx_txn_dt,
      })),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: Option[]) => {
        const optionValues = options.map((option) => moment(option.value).format('YYYY-MM-DD'));
        return {
          options,
          areSameValues: this.checkOptionsAreSame(optionValues),
        };
      })
    );
  }

  formatOptions(options: Option[]): OptionsData {
    const optionValues = options.map((option) => option.value);
    return {
      options,
      areSameValues: this.checkOptionsAreSame(optionValues),
    };
  }

  generatePaymentModeOptions(expenses: Expense[]): Observable<OptionsData> {
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
      map((options: Option[]) => this.formatOptions(options))
    );
  }

  generateVendorOptions(expenses: Expense[]): Observable<OptionsData> {
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
      map((options: Option[]) => this.formatOptions(options))
    );
  }

  generateProjectOptions(expenses: Expense[]): Observable<OptionsData> {
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
      map((options: Option[]) => this.formatOptions(options))
    );
  }

  generateCategoryOptions(expenses: Expense[]): Observable<OptionsData> {
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
      map((options: Option[]) => {
        const optionValues = options.map((option) => option.value);
        return {
          options: this.removeUnspecified(options),
          areSameValues: this.checkOptionsAreSame(optionValues),
        };
      })
    );
  }

  generateTaxGroupOptions(expenses: Expense[]): Observable<OptionsData> {
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
      map((options: Option[]) => this.formatOptions(options))
    );
  }

  generateTaxAmountOptions(expenses: Expense[]): Observable<OptionsData> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_amount !== null),
      map((expense) => ({
        label: expense.tx_amount.toString(),
        value: expense.tx_amount,
      })),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: Option[]) => this.formatOptions(options))
    );
  }

  generateCostCenterOptions(expenses: Expense[]): Observable<OptionsData> {
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
      map((options: Option[]) => this.formatOptions(options))
    );
  }

  generatePurposeOptions(expenses: Expense[]): Observable<OptionsData> {
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
      map((options: Option[]) => this.formatOptions(options))
    );
  }

  generateLocationOptions(expenses: Expense[], locationIndex: number): Observable<OptionsData> {
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
      map((options: Option[]) => {
        const optionLabels = options.map((option) => option.label);
        return {
          options,
          areSameValues: this.checkOptionsAreSame(optionLabels),
        };
      })
    );
  }

  generateOnwardDateOptions(expenses: Expense[]): Observable<OptionsData> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_from_dt !== null),
      map((expense) => ({
        label: moment(expense.tx_from_dt).format('MMM DD, YYYY'),
        value: expense.tx_from_dt,
      })),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: Option[]) => {
        const optionValues = options.map((option) => moment(option.value).format('YYYY-MM-DD'));
        return {
          options,
          areSameValues: this.checkOptionsAreSame(optionValues),
        };
      })
    );
  }

  generateReturnDateOptions(expenses: Expense[]): Observable<OptionsData> {
    return from(expenses).pipe(
      filter((expense) => expense.tx_to_dt !== null),
      map((expense) => ({
        label: moment(expense.tx_to_dt).format('MMM DD, YYYY'),
        value: expense.tx_to_dt,
      })),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: Option[]) => {
        const optionValues = options.map((option) => moment(option.value).format('YYYY-MM-DD'));
        return {
          options,
          areSameValues: this.checkOptionsAreSame(optionValues),
        };
      })
    );
  }

  generateFlightJourneyTravelClassOptions(expenses: Expense[]): Observable<OptionsData> {
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
      map((options: Option[]) => this.formatOptions(options))
    );
  }

  generateFlightReturnTravelClassOptions(expenses: Expense[]): Observable<OptionsData> {
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
      map((options: Option[]) => this.formatOptions(options))
    );
  }

  generateTrainTravelClassOptions(expenses: Expense[]): Observable<OptionsData> {
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
      map((options: Option[]) => this.formatOptions(options))
    );
  }

  generateBusTravelClassOptions(expenses: Expense[]): Observable<OptionsData> {
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
      map((options: Option[]) => this.formatOptions(options))
    );
  }

  generateDistanceOptions(expenses: Expense[]): Observable<OptionsData> {
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
      map((options: Option[]) => this.formatOptions(options))
    );
  }

  generateDistanceUnitOptions(expenses: Expense[]): Observable<OptionsData> {
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
      map((options: Option[]) => this.formatOptions(options))
    );
  }

  removeUnspecified(options: Option[]): Option[] {
    return options.filter(
      (option, index, options) => options.findIndex((currentOption) => currentOption.label === option.label) === index
    );
  }

  formatTaxGroupOption(option: Option): Observable<OptionsData> {
    const taxGroups$ = this.offlineService.getEnabledTaxGroups().pipe(shareReplay(1));
    const taxGroupsOptions$ = taxGroups$.pipe(
      map((taxGroupsOptions) => taxGroupsOptions.map((tg) => ({ label: tg.name, value: tg })))
    );

    return taxGroups$.pipe(
      map((taxGroups) => {
        option.label = taxGroups[taxGroups.map((taxGroup) => taxGroup.id).indexOf(option.value)]?.name;
        return option;
      })
    );
  }

  formatCategoryOption(option: Option): Observable<Option> {
    const allCategories$ = this.offlineService.getAllEnabledCategories();

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

  formatProjectOptions(option: Option): Observable<Option> {
    const projects$ = this.projectService.getAllActive().pipe(shareReplay(1));
    return projects$.pipe(
      map((projects) => {
        const index = projects.map((project) => project?.id).indexOf(option?.value);
        option.label = projects[index]?.name;
        return option;
      })
    );
  }

  generateBillableOptions(expenses: Expense[]): Observable<OptionsData> {
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
      map((options: Option[]) => this.formatOptions(options))
    );
  }

  formatDateOptions(options: Option[]): Option[] {
    return options.map((option) => {
      option.label = moment(option.label).format('MMM DD, YYYY');
      return option;
    });
  }

  formatBillableOptions(option: Option): Option {
    if (option.value === true) {
      option.label = 'Yes';
    } else {
      option.label = 'No';
    }
    return option;
  }

  formatPaymentModeOptions(option: Option): Option {
    if (option.value === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT') {
      option.label = 'Paid via Corporate Card';
    } else if (option.value === 'PERSONAL_ACCOUNT') {
      option.label = 'Paid by Me';
    } else if (option.value === 'PERSONAL_ADVANCE_ACCOUNT') {
      option.label = 'Paid from Advance';
    }
    return option;
  }

  getCategoryName(categoryId: string): Observable<string> {
    return this.offlineService.getAllEnabledCategories().pipe(
      map((categories) => {
        const category = categories.find((category) => category.id === categoryId);
        return category?.name;
      })
    );
  }

  getCustomInputValues(expenses: Expense[]): CustomInputs[] {
    return expenses
      .map((expense) => {
        if (expense.tx_custom_properties !== null && expense.tx_custom_properties.length > 0) {
          return expense.tx_custom_properties;
        }
      })
      .filter((element) => element !== undefined);
  }

  formatCustomInputOptions(combinedCustomProperties: OptionsData[]) {
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

  formatCustomInputOptionsByType(combinedCustomProperties: OptionsData[]) {
    const customProperty = [];

    combinedCustomProperties.forEach((field) => {
      const existing = customProperty.find((option) => option.name === field.name);
      if (field.value) {
        let formatedlabel;
        if (this.dateService.isValidDate(field.value)) {
          formatedlabel = moment(field.value).format('MMM DD, YYYY');
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

  getFieldValue(optionsData: OptionsData) {
    if (optionsData?.areSameValues) {
      return optionsData?.options[0]?.value;
    } else {
      return null;
    }
  }

  getFieldValueOnChange(optionsData: OptionsData, isTouched: boolean, selectedExpenseValue: any, formValue: any) {
    if (!optionsData?.areSameValues && !isTouched) {
      return selectedExpenseValue;
    } else {
      return formValue;
    }
  }
}
