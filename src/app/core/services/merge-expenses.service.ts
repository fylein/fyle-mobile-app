import { Injectable } from '@angular/core';
import { from, Observable, of, Subject } from 'rxjs';
import { concatMap, filter, map, mergeMap, reduce, shareReplay, switchMap } from 'rxjs/operators';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { ISODateString } from '@capacitor/core';
import { Expense } from '../models/expense.model';
import { ExpensesInfo } from './expenses-info.model';
import { FileService } from './file.service';
import { CorporateCreditCardExpenseService } from './corporate-credit-card-expense.service';
import { OfflineService } from './offline.service';
import * as moment from 'moment';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { ProjectsService } from './projects.service';
import { CategoriesService } from './categories.service';

type option = Partial<{ label: string; value: any }>;
type custom_property = Partial<{ name: string; value: any }>;

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
    private categoriesService: CategoriesService
  ) {}

  mergeExpenses(sourceTxnIds: string[], targetTxnId: string, targetTxnFields): Observable<string> {
    return this.apiService.post('/transactions/merge', {
      source_txn_ids: sourceTxnIds,
      target_txn_id: targetTxnId,
      target_txn_fields: targetTxnFields,
    });
  }

  isAllAdvanceExpenses(expenses: Expense[]) {
    return expenses.every((expense) => expense?.source_account_type === 'PERSONAL_ADVANCE_ACCOUNT');
  }

  checkIfAdvanceExpensePresent(expenses: Expense[]) {
    return expenses.filter((expense) => expense?.source_account_type === 'PERSONAL_ADVANCE_ACCOUNT');
  }

  setDefaultExpenseToKeep(expenses: Expense[]) {
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

  getReceiptDetails(file) {
    const extension = this.getReceiptExtension(file.name);
    const fileResponse = {
      type: 'unknown',
      thumbnail: 'img/fy-receipt.svg',
    };

    if (['pdf'].includes(extension)) {
      fileResponse.type = 'pdf';
      fileResponse.thumbnail = 'img/fy-pdf.svg';
    } else if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) {
      fileResponse.type = 'image';
      fileResponse.thumbnail = file.url;
    }

    return fileResponse;
  }

  getReceiptExtension(name: string) {
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

  isApprovedAndAbove(expenses: Expense[]) {
    const approvedAndAboveExpenses = expenses.filter((expense) =>
      ['APPROVED', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'].includes(expense.tx_state)
    );
    return approvedAndAboveExpenses;
  }

  isAdvancePresent(expensesInfo: ExpensesInfo) {
    return expensesInfo.defaultExpenses && expensesInfo.defaultExpenses.length === 1 && expensesInfo.isAdvancePresent;
  }

  isReportedPresent(expenses: Expense[]) {
    return expenses.filter((expense) => expense.tx_state === 'APPROVER_PENDING');
  }

  isMoreThanOneAdvancePresent(expensesInfo: ExpensesInfo, isAllAdvanceExpenses: boolean) {
    return (
      expensesInfo.defaultExpenses &&
      expensesInfo.defaultExpenses.length > 1 &&
      isAllAdvanceExpenses &&
      expensesInfo.isAdvancePresent
    );
  }

  isReportedOrAbove(expensesInfo: ExpensesInfo) {
    return expensesInfo.defaultExpenses && expensesInfo.defaultExpenses.length === 1 && expensesInfo.isReportedAndAbove;
  }

  getAttachements(txnID: string) {
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

  getCardCardTransactions(expenses: Expense[]) {
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
          return this.corporateCreditCardExpenseService.getv2CardTransactions(params).pipe(map((res) => res.data));
        } else {
          return of([]);
        }
      })
    );
  }

  generateExpenseToKeepOptions(expenses: Expense[]) {
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

  generateReceiptOptions(expenses: Expense[]) {
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
    console.log(options);
    console.log(options.some((field, index) => options.indexOf(field) !== index));
    // if(options?.length !== 0){
    //   return true;
    // }
    return options.some((field, index) => options.indexOf(field) !== index);
  }

  generateAmountOptions(expenses: Expense[]) {
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
      map((options: option[]) => {
        const optionLabels = options.map((option) => option.label);
        return {
          options,
          areSameValues: this.checkOptionsAreSame(optionLabels),
        };
      })
    );
  }

  generateDateOfSpendOptions(expenses: Expense[]) {
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
      map((options: option[]) => {
        const optionValues = options.map((option) => new Date(new Date(option.value).toDateString()).getTime());
        return {
          options,
          areSameValues: this.checkOptionsAreSame(optionValues),
        };
      })
    );
  }

  generatePaymentModeOptions(expenses: Expense[]) {
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
      map((options: option[]) => {
        const optionValues = options.map((option) => option.value);
        return {
          options,
          areSameValues: this.checkOptionsAreSame(optionValues),
        };
      })
    );
  }

  generateVendorOptions(expenses: Expense[]) {
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
      map((options: option[]) => {
        const optionValues = options.map((option) => option.value);
        return {
          options,
          areSameValues: this.checkOptionsAreSame(optionValues),
        };
      })
    );
  }

  generateProjectOptions(expenses: Expense[]) {
    return from(expenses).pipe(
      map((expense) => ({
        label: expense.tx_project_id,
        value: expense.tx_project_id,
      })),
      mergeMap((option) => this.formatProjectOptions(option)),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: option[]) => {
        const optionValues = options.map((option) => option.value);
        return {
          options,
          areSameValues: this.checkOptionsAreSame(optionValues),
        };
      })
    );
  }

  generateCategoryOptions(expenses: Expense[]) {
    return from(expenses).pipe(
      map((expense) => ({
        label: expense.tx_org_category_id.toString(),
        value: expense.tx_org_category_id,
      })),
      mergeMap((option) => this.formatCategoryOption(option)),
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      map((options: option[]) => {
        const optionValues = options.map((option) => option.value);
        return {
          options: this.removeUnspecified(options),
          areSameValues: this.checkOptionsAreSame(optionValues),
        };
      })
    );
  }

  removeUnspecified(options: option[]) {
    return options.filter(
      (option, index, options) => options.findIndex((currentOption) => currentOption.label === option.label) === index
    );
  }

  formatCategoryOption(option: option) {
    const allCategories$ = this.offlineService.getAllEnabledCategories().pipe();

    return allCategories$.pipe(
      map((catogories) => this.categoriesService.filterRequired(catogories)),
      map((categories) => {
        // this.categories = categories;
        option.label = categories[categories.map((category) => category.id).indexOf(option.value)]?.displayName;
        if (!option.label) {
          option.label = 'Unspecified';
        }
        return option;
        // .filter(
        //   (option, index, options) =>
        //     options.findIndex((currentOption) => currentOption.label === option.label) === index
        // );
      })
    );
  }

  formatProjectOptions(option: option) {
    const projects$ = this.projectService.getAllActive().pipe(shareReplay(1));
    return projects$.pipe(
      map((projects) => {
        const index = projects.map((project) => project?.id).indexOf(option?.value);
        option.label = projects[index]?.name;
        return option;
      })
    );
  }

  generateBillableOptions(expenses: Expense[]) {
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
      map((options: option[]) => {
        const optionValues = options.map((option) => option.value);
        return {
          options,
          areSameValues: this.checkOptionsAreSame(optionValues),
        };
      })
    );
  }

  formatDateOptions(options: option[]) {
    return options.map((option) => {
      option.label = moment(option.label).format('MMM DD, YYYY');
      return option;
    });
  }

  formatBillableOptions(option: option) {
    if (option.value === true) {
      option.label = 'Yes';
    } else {
      option.label = 'No';
    }
    return option;
  }

  formatPaymentModeOptions(option: option) {
    if (option.value === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT') {
      option.label = 'Paid via Corporate Card';
    } else if (option.value === 'PERSONAL_ACCOUNT') {
      option.label = 'Paid by Me';
    } else if (option.value === 'PERSONAL_ADVANCE_ACCOUNT') {
      option.label = 'Paid from Advance';
    }
    return option;
  }

  generateLocationOptions(expenses: Expense[], locationIndex: number) {
    return expenses
      .filter((expense) => expense.tx_locations[locationIndex])
      .map((expense) => ({
        label: expense.tx_locations[locationIndex]?.formatted_address,
        value: expense.tx_locations[locationIndex],
      }));
  }

  generateCombinedCustomProperties(customProperties: custom_property[]) {
    const combinedCustomProperties = [].concat.apply([], customProperties);
    return combinedCustomProperties.map((field) => {
      if (field.value && field.value instanceof Array) {
        field.options = [
          {
            label: field.value.toString(),
            value: field.value,
          },
        ];
        if (field.value.length === 0) {
          field.options = [];
        }
      } else {
        if (!field.value || field.value !== '') {
          field.options = [];
        } else {
          field.options = [
            {
              label: field.value,
              value: field.value,
            },
          ];
        }
      }
      return field;
    });
  }

  generateCustomPropertieOptions(customProperty) {
    const customPropertiesOptions = customProperty.map((field) => {
      let options;
      if (field.options) {
        options = field.options.filter((option) => option != null);
        options = field.options.filter((option) => option !== '');

        const values = options.map((item) => item.label);

        const isDuplicate = values.some((item, index) => values.indexOf(item) !== index);

        field.isSame = isDuplicate;
        field.options = options;
      } else {
        field.options = [];
      }
      return field;
    });
  }
}
