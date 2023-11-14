import { Injectable } from '@angular/core';
import { CurrencySummary } from 'src/app/core/models/currency-summary.model';
import { ExpenseState } from 'src/app/core/models/expense-state.enum';
import { NameKeyPair } from 'src/app/core/models/name-key-pair.model';
import { PaymentModeSummary } from 'src/app/core/models/payment-mode-summary.model';
import { AccountType } from 'src/app/core/models/platform/v1/account.model';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  constructor() {}

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

  isExpenseInDraft(expense: Expense): boolean {
    return expense.state && expense.state === ExpenseState.DRAFT;
  }

  isCriticalPolicyViolatedExpense(expense: Expense): boolean {
    return typeof expense.policy_amount === 'number' && expense.policy_amount < 0.0001;
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
}
