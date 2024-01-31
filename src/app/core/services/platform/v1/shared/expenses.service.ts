import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ExpenseType } from 'src/app/core/enums/expense-type.enum';
import { FilterState } from 'src/app/core/enums/filter-state.enum';
import { CurrencySummary } from 'src/app/core/models/currency-summary.model';
import { ExpenseState } from 'src/app/core/models/expense-state.enum';
import { NameKeyPair } from 'src/app/core/models/name-key-pair.model';
import { PaymentModeSummary } from 'src/app/core/models/payment-mode-summary.model';
import { AccountType } from 'src/app/core/models/platform/v1/account.model';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { GetExpenseQueryParam } from 'src/app/core/models/platform/v1/get-expenses-query.model';
import { ExpenseFilters } from 'src/app/fyle/my-expenses/expense-filters.model';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { DateService } from '../../../date.service';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  constructor(private dateService: DateService) {}

  isExpenseInDraft(expense: Expense): boolean {
    return expense.state && expense.state === ExpenseState.DRAFT;
  }

  isCriticalPolicyViolatedExpense(expense: Expense): boolean {
    return typeof expense.policy_amount === 'number' && expense.policy_amount < 0.0001;
  }

  excludeCCCExpenses(expenses: Expense[]): Expense[] {
    return expenses.filter((expense) => expense.matched_corporate_card_transaction_ids?.length === 0);
  }

  getVendorDetails(expense: Expense): string {
    const { category, merchant, distance, distance_unit, per_diem_num_days } = expense;
    const systemCategory = category?.system_category?.toLowerCase();
    let vendorDisplayName = merchant;

    if (systemCategory === 'mileage') {
      vendorDisplayName = `${distance || 0} ${distance_unit}`;
    } else if (systemCategory === 'per diem') {
      vendorDisplayName = `${per_diem_num_days || 0} ${per_diem_num_days && per_diem_num_days > 1 ? 'Days' : 'Day'}`;
    }

    return vendorDisplayName;
  }

  getPaymentModeWiseSummary(expenses: Expense[]): PaymentModeSummary {
    const paymentModes = [
      {
        name: 'Reimbursable',
        key: 'reimbursable',
      },
      {
        name: 'Non-Reimbursable',
        key: 'nonReimbursable',
      },
      {
        name: 'Advance',
        key: 'advance',
      },
      {
        name: 'CCC',
        key: 'ccc',
      },
    ];

    return expenses
      .map((expense) => ({
        ...expense,
        paymentMode: this.getPaymentModeForExpense(expense, paymentModes),
      }))
      .reduce((paymentMap: PaymentModeSummary, expenseData) => {
        if (paymentMap.hasOwnProperty(expenseData.paymentMode.key)) {
          paymentMap[expenseData.paymentMode.key].name = expenseData.paymentMode.name;
          paymentMap[expenseData.paymentMode.key].key = expenseData.paymentMode.key;
          paymentMap[expenseData.paymentMode.key].amount += expenseData.amount;
          paymentMap[expenseData.paymentMode.key].count++;
        } else {
          paymentMap[expenseData.paymentMode.key] = {
            name: expenseData.paymentMode.name,
            key: expenseData.paymentMode.key,
            amount: expenseData.amount,
            count: 1,
          };
        }
        return paymentMap;
      }, {});
  }

  getCurrenyWiseSummary(expenses: Expense[]): CurrencySummary[] {
    const currencyMap: Record<string, CurrencySummary> = {};
    for (const expense of expenses) {
      if (!(expense.foreign_currency && expense.foreign_amount)) {
        this.addExpenseToCurrencyMap(currencyMap, expense.currency, expense.amount);
      } else {
        this.addExpenseToCurrencyMap(currencyMap, expense.foreign_currency, expense.amount, expense.foreign_amount);
      }
    }

    return Object.keys(currencyMap)
      .map((currency) => currencyMap[currency])
      .sort((a, b) => (a.amount < b.amount ? 1 : -1));
  }

  getReportableExpenses(expenses: Expense[]): Expense[] {
    return expenses.filter(
      (expense) => !this.isCriticalPolicyViolatedExpense(expense) && !this.isExpenseInDraft(expense) && expense.id
    );
  }

  isMergeAllowed(expenses: Expense[]): boolean {
    if (expenses.length === 2) {
      const areSomeMileageOrPerDiemExpenses = expenses.some((expense) =>
        ['Mileage', 'Per Diem'].includes(expense.category.system_category)
      );
      const areAllExpensesSubmitted = expenses.every((expense) =>
        [
          ExpenseState.APPROVER_PENDING,
          ExpenseState.APPROVED,
          ExpenseState.PAYMENT_PENDING,
          ExpenseState.PAYMENT_PROCESSING,
          ExpenseState.PAID,
        ].includes(expense.state)
      );
      const areAllCCCMatchedExpenses = expenses.every(
        (expense) => expense.matched_corporate_card_transactions.length > 0
      );
      return !areSomeMileageOrPerDiemExpenses && !areAllExpensesSubmitted && !areAllCCCMatchedExpenses;
    } else {
      return false;
    }
  }

  getExpenseDeletionMessage(expensesToBeDeleted: Expense[]): string {
    return `You are about to permanently delete ${
      expensesToBeDeleted?.length === 1 ? '1 selected expense.' : expensesToBeDeleted?.length + ' selected expenses.'
    }`;
  }

  getCCCExpenseMessage(expensesToBeDeleted: Expense[], cccExpenses: number): string {
    return `There ${cccExpenses > 1 ? 'are' : 'is'} ${cccExpenses} corporate card ${
      cccExpenses > 1 ? 'expenses' : 'expense'
    } from the selection which can\'t be deleted. ${
      expensesToBeDeleted?.length > 0 ? 'However you can delete the other expenses from the selection.' : ''
    }`;
  }

  getDeleteDialogBody(
    expensesToBeDeletedCount: number,
    cccExpenses: number,
    expenseDeletionMessage: string,
    cccExpensesMessage: string
  ): string {
    let dialogBody: string;

    if (expensesToBeDeletedCount > 0 && cccExpenses > 0) {
      dialogBody = `<ul class="text-left">
        <li>${cccExpensesMessage}</li>
        <li>Once deleted, the action can't be reversed.</li>
        </ul>
        <p class="confirmation-message text-left">Are you sure to <b>permanently</b> delete the selected expenses?</p>`;
    } else if (expensesToBeDeletedCount > 0 && cccExpenses === 0) {
      dialogBody = `<ul class="text-left">
      <li>${expenseDeletionMessage}</li>
      <li>Once deleted, the action can't be reversed.</li>
      </ul>
      <p class="confirmation-message text-left">Are you sure to <b>permanently</b> delete the selected expenses?</p>`;
    } else if (expensesToBeDeletedCount === 0 && cccExpenses > 0) {
      dialogBody = `<ul class="text-left">
      <li>${cccExpensesMessage}</li>
      </ul>`;
    }

    return dialogBody;
  }

  generateCardNumberParams(
    newQueryParams: Record<string, string | string[] | boolean>,
    filters: Partial<ExpenseFilters>
  ): Record<string, string | string[] | boolean> {
    const newQueryParamsCopy = cloneDeep(newQueryParams);
    if (filters.cardNumbers?.length > 0) {
      let cardNumberString = '';
      cardNumberString = filters.cardNumbers.join(',');
      cardNumberString = cardNumberString.slice(0, cardNumberString.length);
      newQueryParamsCopy['matched_corporate_card_transactions->0->corporate_card_number'] =
        'in.(' + cardNumberString + ')';
    }

    return newQueryParamsCopy;
  }

  generateDateParams(
    newQueryParams: Record<string, string | string[] | boolean>,
    filters: Partial<ExpenseFilters>
  ): Record<string, string | string[] | boolean> {
    let newQueryParamsCopy = cloneDeep(newQueryParams);
    if (filters.date) {
      filters.customDateStart = filters.customDateStart && new Date(filters.customDateStart);
      filters.customDateEnd = filters.customDateEnd && new Date(filters.customDateEnd);
      if (filters.date === DateFilters.thisMonth) {
        const thisMonth = this.dateService.getThisMonthRange();
        newQueryParamsCopy.and = `(spent_at.gte.${thisMonth.from.toISOString()},spent_at.lt.${thisMonth.to.toISOString()})`;
      }

      if (filters.date === DateFilters.thisWeek) {
        const thisWeek = this.dateService.getThisWeekRange();
        newQueryParamsCopy.and = `(spent_at.gte.${thisWeek.from.toISOString()},spent_at.lt.${thisWeek.to.toISOString()})`;
      }

      if (filters.date === DateFilters.lastMonth) {
        const lastMonth = this.dateService.getLastMonthRange();
        newQueryParamsCopy.and = `(spent_at.gte.${lastMonth.from.toISOString()},spent_at.lt.${lastMonth.to.toISOString()})`;
      }

      newQueryParamsCopy = this.generateCustomDateParams(newQueryParamsCopy, filters);
    }

    return newQueryParamsCopy;
  }

  generateCustomDateParams(
    newQueryParams: Record<string, string | string[] | boolean>,
    filters: Partial<ExpenseFilters>
  ): Record<string, string | string[] | boolean> {
    const newQueryParamsCopy = cloneDeep(newQueryParams);
    if (filters.date === DateFilters.custom) {
      const startDate = filters.customDateStart?.toISOString();
      const endDate = filters.customDateEnd?.toISOString();
      if (filters.customDateStart && filters.customDateEnd) {
        newQueryParamsCopy.and = `(spent_at.gte.${startDate},spent_at.lt.${endDate})`;
      } else if (filters.customDateStart) {
        newQueryParamsCopy.and = `(spent_at.gte.${startDate})`;
      } else if (filters.customDateEnd) {
        newQueryParamsCopy.and = `(spent_at.lt.${endDate})`;
      }
    }

    return newQueryParamsCopy;
  }

  generateReceiptAttachedParams(
    newQueryParams: Record<string, string | string[] | boolean>,
    filters: Partial<ExpenseFilters>
  ): Record<string, string | string[] | boolean> {
    const newQueryParamsCopy = cloneDeep(newQueryParams);
    if (filters.receiptsAttached) {
      if (filters.receiptsAttached === 'YES') {
        newQueryParamsCopy.file_ids = 'not_like.[]';
      }

      if (filters.receiptsAttached === 'NO') {
        newQueryParamsCopy.file_ids = 'like.[]';
      }
    }
    return newQueryParamsCopy;
  }

  generateStateFilters(
    newQueryParams: Record<string, string | string[] | boolean>,
    filters: Partial<ExpenseFilters>
  ): Record<string, string | string[] | boolean> {
    const newQueryParamsCopy = cloneDeep(newQueryParams);
    const stateOrFilter = this.generateStateOrFilter(filters, newQueryParamsCopy);
    const or_arr = [];

    if (stateOrFilter.length > 0) {
      let combinedStateOrFilter = stateOrFilter.reduce((param1, param2) => `${param1}, ${param2}`);
      combinedStateOrFilter = `(${combinedStateOrFilter})`;
      or_arr.push(combinedStateOrFilter);
      newQueryParamsCopy.or = or_arr;
    }

    return newQueryParamsCopy;
  }

  generateStateOrFilter(
    filters: Partial<ExpenseFilters>,
    newQueryParamsCopy: Record<string, string | string[] | boolean>
  ): string[] {
    const stateOrFilter: string[] = [];
    if (filters.state) {
      newQueryParamsCopy.report_id = 'is.null';
      if (filters.state.includes(FilterState.READY_TO_REPORT)) {
        stateOrFilter.push('and(state.in.(COMPLETE),or(policy_amount.is.null,policy_amount.gt.0.0001))');
      }

      if (filters.state.includes(FilterState.POLICY_VIOLATED)) {
        stateOrFilter.push('and(is_policy_flagged.eq.true,or(policy_amount.is.null,policy_amount.gt.0.0001))');
      }

      if (filters.state.includes(FilterState.CANNOT_REPORT)) {
        stateOrFilter.push('policy_amount.lt.0.0001');
      }

      if (filters.state.includes(FilterState.DRAFT)) {
        stateOrFilter.push('state.in.(DRAFT)');
      }
    }

    return stateOrFilter;
  }

  generateTypeFilters(
    newQueryParams: Record<string, string | string[] | boolean>,
    filters: Partial<ExpenseFilters>
  ): Record<string, string | string[] | boolean> {
    const newQueryParamsCopy = cloneDeep(newQueryParams);
    const typeOrFilter = this.generateTypeOrFilter(filters);
    const type_or_arr = [];

    if (typeOrFilter.length > 0) {
      let combinedTypeOrFilter = typeOrFilter.reduce((param1, param2) => `${param1}, ${param2}`);
      combinedTypeOrFilter = `(${combinedTypeOrFilter})`;
      type_or_arr.push(combinedTypeOrFilter);
      newQueryParamsCopy.or = type_or_arr;
    }

    return newQueryParamsCopy;
  }

  generateTypeOrFilter(filters: Partial<ExpenseFilters>): string[] {
    const typeOrFilter: string[] = [];
    if (filters.type) {
      if (filters.type.includes(ExpenseType.MILEAGE)) {
        typeOrFilter.push('category->system_category.eq.Mileage');
      }

      if (filters.type.includes(ExpenseType.PER_DIEM)) {
        // The space encoding is done by angular into %20 so no worries here
        typeOrFilter.push('category->system_category.eq.Per Diem');
      }

      if (filters.type.includes('RegularExpenses')) {
        typeOrFilter.push('category->system_category.not_in.(Mileage,Per Diem)');
      }
    }

    return typeOrFilter;
  }

  setSortParams(
    currentParams: Partial<GetExpenseQueryParam>,
    filters: Partial<ExpenseFilters>
  ): Partial<GetExpenseQueryParam> {
    const currentParamsCopy = cloneDeep(currentParams);
    if (filters.sortParam && filters.sortDir) {
      currentParamsCopy.sortParam = filters.sortParam;
      currentParamsCopy.sortDir = filters.sortDir;
    } else {
      currentParamsCopy.sortParam = 'spent_at';
      currentParamsCopy.sortDir = 'desc';
    }

    return currentParamsCopy;
  }

  generateSplitExpenseParams(
    newQueryParams: Record<string, string | string[] | boolean>,
    filters: Partial<ExpenseFilters>
  ): Record<string, string | string[] | boolean> {
    const newQueryParamsCopy = cloneDeep(newQueryParams);
    const split_or_arr = [];
    if (filters.splitExpense) {
      if (filters.splitExpense === 'YES') {
        split_or_arr.push('(is_split.eq.true)');
        newQueryParamsCopy.or = split_or_arr;
      } else if (filters.splitExpense === 'NO') {
        split_or_arr.push('(is_split.eq.false)');
        newQueryParamsCopy.or = split_or_arr;
      }
    }

    return newQueryParamsCopy;
  }

  isExpenseInPaymentMode(
    expenseIsReimbursable: boolean,
    expenseSourceAccountType: string,
    paymentMode: 'reimbursable' | 'nonReimbursable' | 'advance' | 'ccc'
  ): boolean {
    let expenseInPaymentMode = false;
    const isAdvanceOrCCCExpense =
      expenseSourceAccountType === AccountType.PERSONAL_ADVANCE_ACCOUNT ||
      expenseSourceAccountType === AccountType.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT;

    const expensePaymentModeConditions = {
      //Paid by Employee: reimbursable
      reimbursable: expenseIsReimbursable && !isAdvanceOrCCCExpense,
      //Paid by Company: not reimbursable
      nonReimbursable: !expenseIsReimbursable && !isAdvanceOrCCCExpense,
      //Paid from Advance account: not reimbursable
      advance: expenseSourceAccountType === AccountType.PERSONAL_ADVANCE_ACCOUNT,
      //Paid from CCC: not reimbursable
      ccc: expenseSourceAccountType === AccountType.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT,
    };
    expenseInPaymentMode = expensePaymentModeConditions[paymentMode];
    return expenseInPaymentMode;
  }

  generateStatsQueryParams(params: Record<string, string | string[] | boolean>): string {
    const paramKeys = Object.keys(params);
    const queryParams = [];
    paramKeys.forEach((key) => {
      queryParams.push(`${key}=${params[key]}`);
    });

    return queryParams.join('&');
  }

  private getPaymentModeForExpense(expense: Expense, paymentModes: NameKeyPair[]): NameKeyPair {
    const expenseIsReimbursable = expense.is_reimbursable;
    const expenseSourceAccountType = expense.source_account?.type;
    return paymentModes.find((paymentMode) =>
      this.isExpenseInPaymentMode(expenseIsReimbursable, expenseSourceAccountType, paymentMode.key)
    );
  }

  private addExpenseToCurrencyMap(
    currencyMap: Record<string, CurrencySummary>,
    expenseCurrency: string,
    expenseAmount: number,
    expenseForeignAmount: number = null
  ): void {
    if (currencyMap.hasOwnProperty(expenseCurrency)) {
      currencyMap[expenseCurrency].origAmount += expenseForeignAmount ? expenseForeignAmount : expenseAmount;
      currencyMap[expenseCurrency].amount += expenseAmount;
      currencyMap[expenseCurrency].count++;
    } else {
      currencyMap[expenseCurrency] = {
        name: expenseCurrency,
        currency: expenseCurrency,
        amount: expenseAmount,
        origAmount: expenseForeignAmount ? expenseForeignAmount : expenseAmount,
        count: 1,
      };
    }
  }
}
