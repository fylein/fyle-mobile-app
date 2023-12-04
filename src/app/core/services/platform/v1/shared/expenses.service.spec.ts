import { TestBed } from '@angular/core/testing';
import { ExpensesService } from './expenses.service';
import {
  criticalPolicyViolatedExpense,
  expenseData,
  expenseResponseData2,
  expenseResponseData3,
  mileageExpenseWithDistance,
  mileageExpenseWithoutDistance,
  perDiemExpenseWithMultipleNumDays,
  perDiemExpenseWithSingleNumDays,
} from 'src/app/core/mock-data/platform/v1/expense.data';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { ExpenseState } from 'src/app/core/models/expense-state.enum';
import { currencySummaryData } from 'src/app/core/mock-data/currency-summary.data';
import { AccountType } from 'src/app/core/models/platform/v1/account.model';

describe('ExpensesService', () => {
  let service: ExpensesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpensesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isCriticalPolicyViolatedExpense():', () => {
    it('should return false if critical policy is not violated', () => {
      expect(service.isCriticalPolicyViolatedExpense(expenseData)).toBeFalse();
    });

    it('should return true if critical policy is violated', () => {
      expect(service.isCriticalPolicyViolatedExpense(criticalPolicyViolatedExpense)).toBeTrue();
    });
  });

  describe('isExpenseInDraft():', () => {
    it('should return true if transaction is draft', () => {
      const expense: Expense = {
        ...expenseData,
        state: ExpenseState.DRAFT,
      };
      expect(service.isExpenseInDraft(expense)).toBeTrue();
    });

    it('should return false if transaction is not draft', () => {
      const expense: Expense = {
        ...expenseData,
        state: ExpenseState.COMPLETE,
      };
      expect(service.isExpenseInDraft(expense)).toBeFalse();
    });
  });

  describe('getVendorDetails():', () => {
    it('should return vendor details for normal expense', () => {
      const merchant = 'UberTest';
      const expense: Expense = {
        ...expenseData,
        merchant,
      };
      expect(service.getVendorDetails(expense)).toEqual(merchant);
    });

    it('should return vendor details for mileage expense with distance', () => {
      expect(service.getVendorDetails(mileageExpenseWithDistance)).toEqual('25 KM');
    });

    it('should return vendor details for mileage expense without distance', () => {
      expect(service.getVendorDetails(mileageExpenseWithoutDistance)).toEqual('0 KM');
    });

    it('should retuen vendor details for per diem expense with 1 day', () => {
      expect(service.getVendorDetails(perDiemExpenseWithSingleNumDays)).toEqual('1 Day');
    });

    it('should retuen vendor details for per diem expense with multiple days', () => {
      expect(service.getVendorDetails(perDiemExpenseWithMultipleNumDays)).toEqual('3 Days');
    });
  });

  it('getPaymentModeWiseSummary(): should return the payment mode wise summary', () => {
    // @ts-ignore
    spyOn(service, 'getPaymentModeForExpense').and.returnValue({
      name: 'Reimbursable',
      key: 'reimbursable',
    });

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

    const summary = {
      reimbursable: {
        name: 'Reimbursable',
        key: 'reimbursable',
        amount: 20,
        count: 2,
      },
    };

    expect(service.getPaymentModeWiseSummary(expenseResponseData2)).toEqual(summary);
    // @ts-ignore
    expect(service.getPaymentModeForExpense).toHaveBeenCalledWith(expenseResponseData2[0], paymentModes);
    // @ts-ignore
    expect(service.getPaymentModeForExpense).toHaveBeenCalledWith(expenseResponseData2[1], paymentModes);

    // @ts-ignore
    expect(service.getPaymentModeForExpense).toHaveBeenCalledTimes(2);
  });

  it('getCurrenyWiseSummary(): should return the currency wise summary', () => {
    // @ts-ignore
    spyOn(service, 'addExpenseToCurrencyMap').and.callThrough();

    const currencyMap = {
      INR: { name: 'INR', currency: 'INR', amount: 89, origAmount: 89, count: 1 },
      CLF: { name: 'CLF', currency: 'CLF', amount: 33611, origAmount: 12, count: 1 },
      EUR: { name: 'EUR', currency: 'EUR', amount: 15775.76, origAmount: 178, count: 1 },
    };

    expect(service.getCurrenyWiseSummary(expenseResponseData3)).toEqual(currencySummaryData);
    // @ts-ignore
    expect(service.addExpenseToCurrencyMap).toHaveBeenCalledWith(currencyMap, 'INR', 89);
    // @ts-ignore
    expect(service.addExpenseToCurrencyMap).toHaveBeenCalledWith(currencyMap, 'CLF', 33611, 12);
    // @ts-ignore
    expect(service.addExpenseToCurrencyMap).toHaveBeenCalledWith(currencyMap, 'EUR', 15775.76, 178);
    // @ts-ignore
    expect(service.addExpenseToCurrencyMap).toHaveBeenCalledTimes(3);
  });

  it('getPaymentModeForExpense(): should return payment mode for expense', () => {
    spyOn(service, 'isExpenseInPaymentMode').and.returnValue(true);
    const paymentModeList = [
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
    const expensePaymentMode: { name: string; key: 'reimbursable' | 'nonReimbursable' | 'advance' | 'ccc' } = {
      name: 'Reimbursable',
      key: 'reimbursable',
    };
    // @ts-ignore
    expect(service.getPaymentModeForExpense(expenseData, paymentModeList)).toEqual(expensePaymentMode);
    expect(service.isExpenseInPaymentMode).toHaveBeenCalledOnceWith(
      expenseData.is_reimbursable,
      expenseData.source_account.type,
      expensePaymentMode.key
    );
  });

  describe('addExpenseToCurrencyMap():', () => {
    it('should add a new currency to the map when the currencyMap does not exist', () => {
      const currencyMap = {};
      const expenseCurrency = 'USD';
      const expenseAmount = 10;
      // @ts-ignore
      service.addExpenseToCurrencyMap(currencyMap, expenseCurrency, expenseAmount);

      expect(currencyMap).toEqual({
        USD: {
          name: 'USD',
          currency: 'USD',
          amount: 10,
          origAmount: 10,
          count: 1,
        },
      });
    });

    it('should add a new currency to the map with the orig currency', () => {
      const currencyMap = {};
      const expenseCurrency = 'USD';
      const expenseAmount = 10;
      const expenseForeignAmount = 200;
      // @ts-ignore
      service.addExpenseToCurrencyMap(currencyMap, expenseCurrency, expenseAmount, expenseForeignAmount);

      expect(currencyMap).toEqual({
        USD: {
          name: 'USD',
          currency: 'USD',
          amount: 10,
          origAmount: 200,
          count: 1,
        },
      });
    });

    it('should add the transaction amount to an existing currency in the map', () => {
      const currencyMap = {
        USD: {
          name: 'USD',
          currency: 'USD',
          amount: 10,
          origAmount: 10,
          count: 1,
        },
      };
      const expenseCurrency = 'USD';
      const expenseAmount = 20;
      // @ts-ignore
      service.addExpenseToCurrencyMap(currencyMap, expenseCurrency, expenseAmount);

      expect(currencyMap).toEqual({
        USD: {
          name: 'USD',
          currency: 'USD',
          amount: 30,
          origAmount: 30,
          count: 2,
        },
      });
    });

    it('should add the transaction amount and original amount to an existing currency in the map', () => {
      const currencyMap = {
        USD: {
          name: 'USD',
          currency: 'USD',
          amount: 10,
          origAmount: 10,
          count: 1,
        },
      };
      const expenseCurrency = 'USD';
      const expenseAmount = 20;
      const expenseForeignAmount = 30;
      // @ts-ignore
      service.addExpenseToCurrencyMap(currencyMap, expenseCurrency, expenseAmount, expenseForeignAmount);

      expect(currencyMap).toEqual({
        USD: {
          name: 'USD',
          currency: 'USD',
          amount: 30,
          origAmount: 40,
          count: 2,
        },
      });
    });
  });

  describe('isExpenseInPaymentMode():', () => {
    it('should return isExpenseInPaymentMode with reimbursable payment mode', () => {
      const isExpenseReimbursable = true;
      const expensePaymentMode = 'reimbursable';
      const expenseSourceAccountType = AccountType.PERSONAL_CASH_ACCOUNT;
      expect(
        service.isExpenseInPaymentMode(isExpenseReimbursable, expenseSourceAccountType, expensePaymentMode)
      ).toBeTrue();
    });

    it('should return isExpenseInPaymentMode with non-reimbursable payment mode', () => {
      const isExpenseReimbursable = false;
      const expensePaymentMode = 'nonReimbursable';
      const expenseSourceAccountType = AccountType.PERSONAL_CASH_ACCOUNT;
      expect(
        service.isExpenseInPaymentMode(isExpenseReimbursable, expenseSourceAccountType, expensePaymentMode)
      ).toBeTrue();
    });

    it('should return isExpenseInPaymentMode with advance payment mode', () => {
      const isExpenseReimbursable = true;
      const expensePaymentMode = 'advance';
      const expenseSourceAccountType = AccountType.PERSONAL_ADVANCE_ACCOUNT;
      expect(
        service.isExpenseInPaymentMode(isExpenseReimbursable, expenseSourceAccountType, expensePaymentMode)
      ).toBeTrue();
    });

    it('should return isExpenseInPaymentMode with advance payment mode', () => {
      const isExpenseReimbursable = true;
      const expensePaymentMode = 'ccc';
      const expenseSourceAccountType = AccountType.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT;
      expect(
        service.isExpenseInPaymentMode(isExpenseReimbursable, expenseSourceAccountType, expensePaymentMode)
      ).toBeTrue();
    });
  });
});
