import { Injectable } from '@angular/core';
import { CurrencySummary } from 'src/app/core/models/currency-summary.model';
import { ExpenseState } from 'src/app/core/models/expense-state.enum';
import { PaymentModeSummary } from 'src/app/core/models/payment-mode-summary.model';
import { AccountType } from 'src/app/core/models/platform/v1/account.model';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';

type PaymentMode = {
  name: string;
  key: string;
};

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  constructor() {}

  isExpenseInPaymentMode(
    expenseSkipReimbursement: boolean,
    expenseSourceAccountType: string,
    paymentMode: string
  ): boolean {
    let etxnInPaymentMode = false;
    const isAdvanceOrCCCEtxn =
      expenseSourceAccountType === AccountType.PERSONAL_ADVANCE_ACCOUNT ||
      expenseSourceAccountType === AccountType.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT;

    if (paymentMode === 'reimbursable') {
      //Paid by Employee: reimbursable
      etxnInPaymentMode = !expenseSkipReimbursement && !isAdvanceOrCCCEtxn;
    } else if (paymentMode === 'nonReimbursable') {
      //Paid by Company: not reimbursable
      etxnInPaymentMode = expenseSkipReimbursement && !isAdvanceOrCCCEtxn;
    } else if (paymentMode === 'advance') {
      //Paid from Advance account: not reimbursable
      etxnInPaymentMode = expenseSourceAccountType === AccountType.PERSONAL_ADVANCE_ACCOUNT;
    } else if (paymentMode === 'ccc') {
      //Paid from CCC: not reimbursable
      etxnInPaymentMode = expenseSourceAccountType === AccountType.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT;
    }
    return etxnInPaymentMode;
  }

  private getPaymentModeForExpense(expense: Expense, paymentModes: PaymentMode[]): PaymentMode {
    const expenseSkipReimbursement = !expense.is_reimbursable;
    const expenseSourceAccountType = expense.source_account?.type;
    return paymentModes.find((paymentMode) =>
      this.isExpenseInPaymentMode(expenseSkipReimbursement, expenseSourceAccountType, paymentMode.key)
    );
  }

  private addExpenseToCurrencyMap(
    currencyMap: Record<string, CurrencySummary>,
    txCurrency: string,
    txAmount: number,
    txOrigAmount: number = null
  ): void {
    if (currencyMap.hasOwnProperty(txCurrency)) {
      currencyMap[txCurrency].origAmount += txOrigAmount ? txOrigAmount : txAmount;
      currencyMap[txCurrency].amount += txAmount;
      currencyMap[txCurrency].count++;
    } else {
      currencyMap[txCurrency] = {
        name: txCurrency,
        currency: txCurrency,
        amount: txAmount,
        origAmount: txOrigAmount ? txOrigAmount : txAmount,
        count: 1,
      };
    }
  }

  getIsDraft(expense: Expense): boolean {
    return expense.state && expense.state === ExpenseState.DRAFT;
  }

  getIsCriticalPolicyViolated(expense: Expense): boolean {
    return typeof expense.policy_amount === 'number' && expense.policy_amount < 0.0001;
  }

  getVendorDetails(expense: Expense): string {
    const systemCategory = expense.category?.system_category?.toLocaleLowerCase();
    let vendorDisplayName = expense.merchant;

    if (systemCategory === 'mileage') {
      vendorDisplayName = (expense.distance || 0).toString();
      vendorDisplayName += ' ' + expense.distance_unit;
    } else if (systemCategory === 'per diem') {
      vendorDisplayName = expense.per_diem_num_days?.toString();
      if (expense.per_diem_num_days > 1) {
        vendorDisplayName += ' Days';
      } else {
        vendorDisplayName += ' Day';
      }
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
      .reduce((paymentMap: PaymentModeSummary, etxnData) => {
        if (paymentMap.hasOwnProperty(etxnData.paymentMode.key)) {
          paymentMap[etxnData.paymentMode.key].name = etxnData.paymentMode.name;
          paymentMap[etxnData.paymentMode.key].key = etxnData.paymentMode.key;
          paymentMap[etxnData.paymentMode.key].amount += etxnData.amount;
          paymentMap[etxnData.paymentMode.key].count++;
        } else {
          paymentMap[etxnData.paymentMode.key] = {
            name: etxnData.paymentMode.name,
            key: etxnData.paymentMode.key,
            amount: etxnData.amount,
            count: 1,
          };
        }
        return paymentMap;
      }, {});
  }

  getCurrenyWiseSummary(expenses: Expense[]): CurrencySummary[] {
    const currencyMap: Record<string, CurrencySummary> = {};
    expenses.forEach((expense) => {
      if (!(expense.foreign_currency && expense.foreign_amount)) {
        this.addExpenseToCurrencyMap(currencyMap, expense.currency, expense.amount);
      } else {
        this.addExpenseToCurrencyMap(currencyMap, expense.foreign_currency, expense.amount, expense.foreign_amount);
      }
    });

    return Object.keys(currencyMap)
      .map((currency) => currencyMap[currency])
      .sort((a, b) => (a.amount < b.amount ? 1 : -1));
  }
}
