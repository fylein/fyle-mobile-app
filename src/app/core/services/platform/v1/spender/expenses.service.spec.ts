import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ExpensesService } from './expenses.service';
import { SpenderService } from './spender.service';
import {
  expenseData,
  expenseResponseData,
  readyToReportExpensesData2,
  splitExpensesData,
} from 'src/app/core/mock-data/platform/v1/expense.data';
import { PAGINATION_SIZE } from 'src/app/constants';
import { expenseResponse, expensesResponse } from 'src/app/core/mock-data/platform/v1/expenses-response.data';
import { getExpensesQueryParams } from 'src/app/core/mock-data/platform/v1/expenses-query-params.data';
import { expenseDuplicateSets } from 'src/app/core/mock-data/platform/v1/expense-duplicate-sets.data';
import { completeStats } from 'src/app/core/mock-data/platform/v1/expenses-stats.data';
import { ExpensesService as SharedExpenseService } from '../shared/expenses.service';
import { expensesCacheBuster$ } from 'src/app/core/cache-buster/expense-cache-buster';
import {
  attachReceiptPayload1,
  attachReceiptsPayload1,
} from 'src/app/core/mock-data/platform/v1/attach-receipt-payload.data';
import { splitPayloadData1 } from 'src/app/core/mock-data/split-payload.data';
import { splitPolicyExp1 } from 'src/app/core/mock-data/split-expense-policy.data';
import { SplitExpenseMissingFieldsData } from 'src/app/core/mock-data/split-expense-missing-fields.data';
import { CorporateCreditCardExpenseService } from '../../../corporate-credit-card-expense.service';
import {
  ccTransactionResponseData,
  ccTransactionResponseData3,
} from 'src/app/core/mock-data/corporate-card-transaction-response.data';
import { cloneDeep } from 'lodash';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';
import { Transaction } from 'src/app/core/models/v1/transaction.model';
import { transformedExpensePayload, txnAmount1 } from 'src/app/core/mock-data/transaction.data';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { generatedFormPropertiesData1 } from 'src/app/core/mock-data/generated-form-properties.data';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let spenderService: jasmine.SpyObj<SpenderService>;
  let sharedExpenseService: jasmine.SpyObj<SharedExpenseService>;
  let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;

  beforeEach(() => {
    const spenderServiceSpy = jasmine.createSpyObj('SpenderService', ['get', 'post']);
    const sharedExpenseServiceSpy = jasmine.createSpyObj('SharedExpenseService', ['generateStatsQueryParams']);
    const corporateCreditCardExpenseServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'getMatchedTransactionById',
    ]);

    TestBed.configureTestingModule({
      providers: [
        { provide: SpenderService, useValue: spenderServiceSpy },
        { provide: SharedExpenseService, useValue: sharedExpenseServiceSpy },
        {
          provide: PAGINATION_SIZE,
          useValue: 2,
        },
        {
          provide: CorporateCreditCardExpenseService,
          useValue: corporateCreditCardExpenseServiceSpy,
        },
      ],
    });
    service = TestBed.inject(ExpensesService);
    spenderService = TestBed.inject(SpenderService) as jasmine.SpyObj<SpenderService>;
    sharedExpenseService = TestBed.inject(SharedExpenseService) as jasmine.SpyObj<SharedExpenseService>;
    corporateCreditCardExpenseService = TestBed.inject(
      CorporateCreditCardExpenseService
    ) as jasmine.SpyObj<CorporateCreditCardExpenseService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getExpenseById():', () => {
    it('should return expense with the given id', (done) => {
      spenderService.get.and.returnValue(of({ data: [expenseData] }));
      const expenseId = 'txOJVaaPxo9O';

      service.getExpenseById(expenseId).subscribe((response) => {
        expect(response).toBeTruthy();
        expect(response).toEqual(expenseData);

        expect(spenderService.get).toHaveBeenCalledOnceWith(`/expenses`, {
          params: {
            id: `eq.${expenseId}`,
          },
        });
        done();
      });
    });

    it('should return expense with the given id and fill matched_corporate_card_transactions by making API call', (done) => {
      const mockExpenseData = cloneDeep(expenseData);
      mockExpenseData.matched_corporate_card_transactions = [];
      mockExpenseData.matched_corporate_card_transaction_ids = ['btxnBdS2Kpvzhy'];
      spenderService.get.and.returnValue(of({ data: [mockExpenseData] }));

      const mockCCTransactionRes = cloneDeep(ccTransactionResponseData);
      mockCCTransactionRes.data[0].transaction_status = ExpenseTransactionStatus.PENDING;
      corporateCreditCardExpenseService.getMatchedTransactionById.and.returnValue(of(mockCCTransactionRes));

      const expenseId = 'txOJVaaPxo9O';

      service.getExpenseById(expenseId).subscribe((response) => {
        expect(response).toBeTruthy();

        expect(spenderService.get).toHaveBeenCalledOnceWith(`/expenses`, {
          params: {
            id: `eq.${expenseId}`,
          },
        });

        expect(corporateCreditCardExpenseService.getMatchedTransactionById).toHaveBeenCalledOnceWith('btxnBdS2Kpvzhy');

        expect(response).toEqual(mockExpenseData);

        expect(response.matched_corporate_card_transactions[0].status).toEqual(ExpenseTransactionStatus.PENDING);

        done();
      });
    });
  });

  it('getExpensesCount(): should return the count of expenses', (done) => {
    spenderService.get.and.returnValue(of(expensesResponse));

    service.getExpensesCount(getExpensesQueryParams).subscribe((response) => {
      expect(response).toBeTruthy();
      expect(response).toEqual(expensesResponse.count);

      expect(spenderService.get).toHaveBeenCalledOnceWith('/expenses', {
        params: getExpensesQueryParams,
      });
      done();
    });
  });

  describe('getExpenses():', () => {
    it('should return the expenses', (done) => {
      spenderService.get.and.returnValue(of(expensesResponse));

      service.getExpenses(getExpensesQueryParams).subscribe((response) => {
        expect(response).toBeTruthy();
        expect(response).toEqual(expensesResponse.data);

        expect(spenderService.get).toHaveBeenCalledOnceWith('/expenses', {
          params: getExpensesQueryParams,
        });
        done();
      });
    });

    it('should return expenses with matched_corporate_card_transactions filled by calling API', (done) => {
      const mockExpensesResponse = cloneDeep(expensesResponse);

      const expenseWithUnmatchedCCTransactions = cloneDeep(expenseData);
      expenseWithUnmatchedCCTransactions.matched_corporate_card_transactions = [];

      const expenseWithUnmatchedCCTransactions2 = cloneDeep(expenseData);
      expenseWithUnmatchedCCTransactions2.matched_corporate_card_transaction_ids = ['btxnBdS2Kpvzhy'];
      expenseWithUnmatchedCCTransactions2.matched_corporate_card_transactions = [];

      mockExpensesResponse.data = [
        expenseWithUnmatchedCCTransactions,
        expenseData,
        expenseWithUnmatchedCCTransactions2,
      ];

      spenderService.get.and.returnValues(of(mockExpensesResponse), of(ccTransactionResponseData3));

      service.getExpenses(getExpensesQueryParams).subscribe((response) => {
        expect(response).toBeTruthy();
        expect(response).toEqual(mockExpensesResponse.data);

        expect(spenderService.get).toHaveBeenCalledTimes(2);

        expect(spenderService.get).toHaveBeenCalledWith('/expenses', {
          params: getExpensesQueryParams,
        });

        expect(spenderService.get).toHaveBeenCalledWith('/corporate_card_transactions', {
          params: {
            id: 'in.(btxn7DbV1VYnmT,btxnBdS2Kpvzhy)',
          },
        });

        expect(response[0].matched_corporate_card_transactions[0].status).toEqual(ExpenseTransactionStatus.POSTED);
        expect(response[1].matched_corporate_card_transactions[0].status).toEqual(ExpenseTransactionStatus.PENDING);
        expect(response[2].matched_corporate_card_transactions[0].status).toEqual(ExpenseTransactionStatus.PENDING);

        done();
      });
    });
  });

  describe('getAllExpenses(): ', () => {
    it('should get all expenses for multiple pages', (done) => {
      expensesCacheBuster$.next(null);
      spyOn(service, 'getExpensesCount').and.returnValue(of(4));
      spyOn(service, 'getExpenses').and.returnValue(of(readyToReportExpensesData2));

      const queryParams = {
        report_id: 'is.null',
        state: 'in.(COMPLETE)',
        order: 'spent_at.desc',
        or: ['(policy_amount.is.null,policy_amount.gt.0.0001)'],
      };

      service.getAllExpenses({ queryParams }).subscribe((res) => {
        expect(res.length).toEqual(4);
        expect(service.getExpensesCount).toHaveBeenCalledOnceWith(queryParams);
        expect(service.getExpenses).toHaveBeenCalledTimes(2);
        done();
      });
    });

    it('should get all expenses in a single page', (done) => {
      expensesCacheBuster$.next(null);
      spyOn(service, 'getExpensesCount').and.returnValue(of(2));
      spyOn(service, 'getExpenses').and.returnValue(of(readyToReportExpensesData2));

      const queryParams = {
        report_id: 'is.null',
        state: 'in.(COMPLETE)',
        order: 'spent_at.desc',
        or: ['(policy_amount.is.null,policy_amount.gt.0.0001)'],
      };

      service.getAllExpenses({ queryParams }).subscribe((res) => {
        expect(res.length).toEqual(2);
        expect(service.getExpensesCount).toHaveBeenCalledOnceWith(queryParams);
        expect(service.getExpenses).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  it('getReportExpenses(): should return all expenses', (done) => {
    spyOn(service, 'getExpensesCount').and.returnValue(of(2));
    spyOn(service, 'getExpenses').and.returnValue(of(expensesResponse.data));
    const reportId = 'rpSGcIEwzxDd';
    const params = {
      report_id: `eq.${reportId}`,
      order: 'spent_at.desc,id.desc',
    };

    service.getReportExpenses(reportId).subscribe((response) => {
      expect(response).toBeTruthy();
      expect(response).toEqual(expensesResponse.data);
      expect(service.getExpensesCount).toHaveBeenCalledOnceWith(params);
      expect(service.getExpenses).toHaveBeenCalledWith({
        ...params,
        offset: 0,
        limit: 2,
      });
      done();
    });
  });

  it('getDuplicateSets(): should return expense duplicate sets', (done) => {
    spenderService.get.and.returnValue(of({ data: expenseDuplicateSets }));

    service.getDuplicateSets().subscribe((response) => {
      expect(response).toEqual(expenseDuplicateSets);

      expect(spenderService.get).toHaveBeenCalledOnceWith('/expenses/duplicate_sets');
      done();
    });
  });

  it('getDuplicatesByExpense() : should get the duplicates by expense', (done) => {
    const expenseId = 'txaiCW1efU0n';
    spenderService.get.and.returnValue(of({ data: expenseDuplicateSets }));

    service.getDuplicatesByExpense(expenseId).subscribe((response) => {
      expect(response).toEqual(expenseDuplicateSets);

      expect(spenderService.get).toHaveBeenCalledOnceWith('/expenses/duplicate_sets', {
        params: {
          expense_id: 'txaiCW1efU0n',
        },
      });
      done();
    });
  });

  it('getExpenseStats(): should get expense stats for unreported stats', (done) => {
    spenderService.post.and.returnValue(of(completeStats));
    sharedExpenseService.generateStatsQueryParams.and.returnValue(
      'state=in.(COMPLETE)&report_id=is.null&or=(policy_amount.is.null,policy_amount.gt.0.0001)'
    );

    const queryParams = {
      state: 'in.(COMPLETE)',
      report_id: 'is.null',
      or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
    };
    service.getExpenseStats(queryParams).subscribe((res) => {
      expect(res).toEqual(completeStats);
      expect(sharedExpenseService.generateStatsQueryParams).toHaveBeenCalledOnceWith(queryParams);
      expect(spenderService.post).toHaveBeenCalledOnceWith('/expenses/stats', {
        data: {
          query_params: 'state=in.(COMPLETE)&report_id=is.null&or=(policy_amount.is.null,policy_amount.gt.0.0001)',
        },
      });
      done();
    });
  });

  it('dismissDuplicates(): should dismiss duplicate expenses', (done) => {
    spenderService.post.and.returnValue(of({}));

    const duplicateExpenseIds = ['tx1234', 'tx2345'];
    const targetExpenseIds = ['tx1234', 'tx2345'];

    service.dismissDuplicates(duplicateExpenseIds, targetExpenseIds).subscribe(() => {
      expect(spenderService.post).toHaveBeenCalledOnceWith('/expenses/dismiss_duplicates/bulk', {
        data: [
          {
            id: 'tx1234',
            duplicate_expense_ids: ['tx1234', 'tx2345'],
          },
          {
            id: 'tx2345',
            duplicate_expense_ids: ['tx1234', 'tx2345'],
          },
        ],
      });
      done();
    });
  });

  it('getSplitExpenses(): should return the list of expenses based on splitGroupId', (done) => {
    const splitGroupId = 'tx6I9xcOZFU6';
    const queryParams = {
      split_group_id: 'eq.tx6I9xcOZFU6',
    };
    spyOn(service, 'getAllExpenses').and.returnValue(of(splitExpensesData));

    service.getSplitExpenses(splitGroupId).subscribe((res) => {
      expect(res).toEqual(splitExpensesData);
      expect(service.getAllExpenses).toHaveBeenCalledOnceWith({ queryParams });
      done();
    });
  });

  it('attachReceiptToExpense(): should attach a receipt to an expense', (done) => {
    spenderService.post.and.returnValue(of(expenseResponse));

    service
      .attachReceiptToExpense(attachReceiptPayload1.data.id, attachReceiptPayload1.data.file_id)
      .subscribe((res) => {
        expect(res).toEqual(expenseData);
        expect(spenderService.post).toHaveBeenCalledOnceWith('/expenses/attach_receipt', attachReceiptPayload1);
        done();
      });
  });

  it('attachReceiptsToExpense(): should attach multiple receipts to an expense', (done) => {
    spenderService.post.and.returnValue(of(expensesResponse));

    service
      .attachReceiptsToExpense(attachReceiptPayload1.data.id, attachReceiptsPayload1.data[0].file_ids)
      .subscribe((res) => {
        expect(res).toEqual(expensesResponse.data);
        expect(spenderService.post).toHaveBeenCalledOnceWith('/expenses/attach_files/bulk', attachReceiptsPayload1);
        done();
      });
  });

  it('splitExpenseCheckPolicies(): should get expense policy check for split expense', (done) => {
    spenderService.post.and.returnValue(of(splitPolicyExp1));

    service.splitExpenseCheckPolicies(splitPayloadData1).subscribe((res) => {
      expect(res).toEqual(splitPolicyExp1);
      expect(spenderService.post).toHaveBeenCalledOnceWith('/expenses/split/check_policies', {
        data: splitPayloadData1,
      });
      done();
    });
  });

  it('splitExpenseCheckMissingFields(): should get expense policy check missing fields for split expense', (done) => {
    spenderService.post.and.returnValue(of(SplitExpenseMissingFieldsData));

    service.splitExpenseCheckMissingFields(splitPayloadData1).subscribe((res) => {
      expect(res).toEqual(SplitExpenseMissingFieldsData);
      expect(spenderService.post).toHaveBeenCalledOnceWith('/expenses/split/check_mandatory_fields', {
        data: splitPayloadData1,
      });
      done();
    });
  });

  describe('transformTo', () => {
    let transaction: Partial<Transaction>;
    let expensePayload: Partial<Expense>;

    beforeEach(() => {
      transaction = cloneDeep(txnAmount1);
      expensePayload = {
        ...transformedExpensePayload,
      };
    });

    it('should transform a Transaction to Expense payload', () => {
      const result = service.transformTo(txnAmount1);
      expect(result).toEqual(expensePayload);
    });

    it('should include flight travel classes if category is flight or airlines', () => {
      transaction.fyle_category = 'Airlines';
      transaction.flight_journey_travel_class = 'Economy';
      transaction.flight_return_travel_class = 'Business';
      expensePayload.travel_classes = ['Economy', 'Business'];

      const result = service.transformTo(transaction);
      expect(result.travel_classes).toEqual(['Economy', 'Business']);
    });

    it('should only include flight_journey_travel_class when return class is not present', () => {
      transaction.fyle_category = 'Airlines';
      transaction.flight_journey_travel_class = 'Economy';
      transaction.flight_return_travel_class = null;
      expensePayload.travel_classes = ['Economy'];

      const result = service.transformTo(transaction);
      expect(result.travel_classes).toEqual(['Economy']);
    });

    it('should include bus travel class if category is bus', () => {
      transaction.fyle_category = 'bus';
      transaction.bus_travel_class = 'Luxury';
      expensePayload.travel_classes = ['Luxury'];

      const result = service.transformTo(transaction);
      expect(result.travel_classes).toEqual(['Luxury']);
    });

    it('should include train travel class if category is train', () => {
      transaction.fyle_category = 'train';
      transaction.train_travel_class = 'First Class';
      expensePayload.travel_classes = ['First Class'];

      const result = service.transformTo(transaction);
      expect(result.travel_classes).toEqual(['First Class']);
    });

    it('should not include any travel classes if category is not flight, bus, or train', () => {
      transaction.fyle_category = 'taxi';
      expensePayload.travel_classes = [];

      const result = service.transformTo(transaction);
      expect(result.travel_classes).toEqual([]);
    });

    it('should include multiple travel classes when both journey and return classes are present for flight', () => {
      transaction.fyle_category = 'Airlines';
      transaction.flight_journey_travel_class = 'Premium Economy';
      transaction.flight_return_travel_class = 'Economy';
      expensePayload.travel_classes = ['Premium Economy', 'Economy'];

      const result = service.transformTo(transaction);
      expect(result.travel_classes).toEqual(['Premium Economy', 'Economy']);
    });

    it('should not add travel class if travel class fields are undefined for flight', () => {
      transaction.fyle_category = 'Airlines';
      transaction.flight_journey_travel_class = undefined;
      transaction.flight_return_travel_class = undefined;
      expensePayload.travel_classes = [];

      const result = service.transformTo(transaction);
      expect(result.travel_classes).toEqual([]);
    });
  });

  it('post(): should post expenses', (done) => {
    spenderService.post.and.returnValue(of({}));

    const expenseWithAdvanceWalletId = {
      id: 'tx1234',
      advance_wallet_id: 'areq123',
    };

    service.post(expenseWithAdvanceWalletId).subscribe(() => {
      expect(spenderService.post).toHaveBeenCalledOnceWith('/expenses', {
        data: expenseWithAdvanceWalletId,
      });
      done();
    });
  });

  it('createFromFile(): should post fileId, source to create expense', (done) => {
    spenderService.post.and.returnValue(of({}));

    const fileId = 'file123';
    const source = 'email';

    service.createFromFile(fileId, source).subscribe((response) => {
      expect(spenderService.post).toHaveBeenCalledOnceWith('/expenses/create_from_file/bulk', {
        data: [
          {
            file_id: fileId,
            source,
          },
        ],
      });
      done();
    });
  });

  describe('deleteExpenses()', () => {
    it('should call spenderService.post with correct payload and return void', (done) => {
      const expenseIds = ['exp1', 'exp2', 'exp3'];
      const expectedPayload = {
        data: [{ id: 'exp1' }, { id: 'exp2' }, { id: 'exp3' }],
      };

      spenderService.post.and.returnValue(of({}));

      service.deleteExpenses(expenseIds).subscribe((result) => {
        expect(spenderService.post).toHaveBeenCalledOnceWith('/expenses/delete/bulk', expectedPayload);
        expect(result).toBeUndefined();
        done();
      });
    });
  });

  it('mergeExpenses(): should call spenderService.post with correct payload and return expense', (done) => {
    const mergeExpensesPayload = {
      source_expense_ids: ['tx3nHShG60zq'],
      target_expense_id: 'txBphgnCHHeO',
      target_expense_fields: generatedFormPropertiesData1,
    };

    spenderService.post.and.returnValue(of({ data: expenseData }));

    service.mergeExpenses(mergeExpensesPayload).subscribe((res) => {
      expect(res).toEqual(expenseData);
      expect(spenderService.post).toHaveBeenCalledOnceWith('/expenses/merge', { data: mergeExpensesPayload });
      done();
    });
  });
});
