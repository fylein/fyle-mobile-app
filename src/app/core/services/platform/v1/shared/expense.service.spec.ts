import { TestBed } from '@angular/core/testing';
import { ExpenseService } from './expense.service';
import {
  criticalPolicyViolatedExpense,
  expenseData,
  mileageExpenseWithDistance,
  mileageExpenseWithoutDistance,
  perDiemExpenseWithMultipleNumDays,
  perDiemExpenseWithSingleNumDays,
} from 'src/app/core/mock-data/platform/v1/expense.data';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { ExpenseState } from 'src/app/core/models/expense-state.enum';

describe('ExpenseService', () => {
  let service: ExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getIsCriticalPolicyViolated():', () => {
    it('should return false if critical policy is not violated', () => {
      expect(service.getIsCriticalPolicyViolated(expenseData)).toBeFalse();
    });

    it('should return true if critical policy is violated', () => {
      expect(service.getIsCriticalPolicyViolated(criticalPolicyViolatedExpense)).toBeTrue();
    });
  });

  describe('getIsDraft():', () => {
    it('should return true if transaction is draft', () => {
      expect(service.getIsDraft(expenseData)).toBeTrue();
    });

    it('should return false if transaction is not draft', () => {
      const expense: Expense = {
        ...expenseData,
        state: ExpenseState.COMPLETE,
      };
      expect(service.getIsDraft(expense)).toBeFalse();
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
});
