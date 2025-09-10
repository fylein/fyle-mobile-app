import { CurrencyPipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { cloneDeep } from 'lodash';
import { of } from 'rxjs';
import { selectedExpense1, selectedExpenses } from 'src/app/core/mock-data/expense.data';
import {
  expenseData,
  nonReimbursableExpense,
  readyToReportExpensesData,
  readyToReportExpensesData2,
} from 'src/app/core/mock-data/platform/v1/expense.data';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { ExactCurrencyPipe } from 'src/app/shared/pipes/exact-currency.pipe';
import { StorageService } from '../../core/services/storage.service';
import { TrackingService } from '../../core/services/tracking.service';
import { MyCreateReportPage } from './my-create-report.page';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { orgSettingsPendingRestrictions, orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { expectedReportsSinglePage } from '../../core/mock-data/platform-report.data';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';
import { getTranslocoTestingModule } from 'src/app/core/testing/transloco-testing.utils';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('MyCreateReportPage', () => {
  let component: MyCreateReportPage;
  let fixture: ComponentFixture<MyCreateReportPage>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let router: jasmine.SpyObj<Router>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let expensesService: jasmine.SpyObj<ExpensesService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let spenderReportsService: jasmine.SpyObj<SpenderReportsService>;

  beforeEach(waitForAsync(() => {
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['getAllExpenses']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['createFirstReport', 'createReport']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['getAllExpenses']);
    const spenderReportsServiceSpy = jasmine.createSpyObj('SpenderReportsService', [
      'addExpenses',
      'createDraft',
      'getReportsCount',
      'suggestPurpose',
      'create',
    ]);

    TestBed.configureTestingModule({
      imports: [getTranslocoTestingModule(),
        RouterTestingModule,
        FormsModule,
        MatCheckboxModule,
        MyCreateReportPage,
        HumanizeCurrencyPipe,
        ExactCurrencyPipe,
        MatIconTestingModule],
      providers: [
        FyCurrencyPipe,
        CurrencyPipe,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                txnIds: [],
              },
            },
          },
        },
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: TransactionService,
          useValue: transactionServiceSpy,
        },
        {
          provide: CurrencyService,
          useValue: currencyServiceSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: StorageService,
          useValue: storageServiceSpy,
        },
        {
          provide: ExpensesService,
          useValue: expensesServiceSpy,
        },
        {
          provide: SpenderReportsService,
          useValue: spenderReportsServiceSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(MyCreateReportPage);
    component = fixture.componentInstance;

    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
    spenderReportsService = TestBed.inject(SpenderReportsService) as jasmine.SpyObj<SpenderReportsService>;

    currencyService.getHomeCurrency.and.returnValue(of('USD'));
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('detectTitleChange()', () => {
    it('should not show report name error if title exists', () => {
      component.reportTitle = '# Sept 23';
      fixture.detectChanges();

      component.detectTitleChange();
      expect(component.emptyInput).toBeFalse();
      expect(component.showReportNameError).toBeFalse();
    });

    it('should show report name error', () => {
      component.reportTitle = '';
      fixture.detectChanges();

      component.detectTitleChange();
      expect(component.emptyInput).toBeTrue();
      expect(component.showReportNameError).toBeTrue();
    });
  });

  describe('cancel():', () => {
    it('should navigate to my expenses if there are any selected txns', () => {
      component.selectedExpenseIDs = ['txfCdl3TEZ7K'];
      fixture.detectChanges();

      component.cancel();
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
    });

    it('should navigate to my reports if there are no selected txns', () => {
      component.selectedExpenseIDs = [];
      fixture.detectChanges();

      component.cancel();
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_reports']);
    });
  });

  it('sendFirstReportCreated(): should set a new report if first report not created', fakeAsync(() => {
    storageService.get.and.resolveTo(false);
    spenderReportsService.getReportsCount.and.returnValue(of(0));
    spyOn(component, 'getTotalSelectedExpensesAmount').and.returnValue(150);
    component.readyToReportExpenses = [...readyToReportExpensesData, expenseData];
    component.selectedElements = readyToReportExpensesData;
    fixture.detectChanges();

    component.sendFirstReportCreated();
    tick(1000);

    expect(spenderReportsService.getReportsCount).toHaveBeenCalledOnceWith({});
    expect(trackingService.createFirstReport).toHaveBeenCalledOnceWith({
      Expense_Count: 2,
      Report_Value: 150,
    });
    expect(component.getTotalSelectedExpensesAmount).toHaveBeenCalledOnceWith(readyToReportExpensesData);
    expect(storageService.get).toHaveBeenCalledOnceWith('isFirstReportCreated');
    expect(storageService.set).toHaveBeenCalledOnceWith('isFirstReportCreated', true);
  }));

  describe('ctaClickedEvent():', () => {
    beforeEach(() => {
      spyOn(component, 'sendFirstReportCreated');
      spenderReportsService.createDraft.and.returnValue(of(expectedReportsSinglePage[0]));
    });

    it('should create a draft report and add transactions to it, if there are any selected expenses', () => {
      spenderReportsService.addExpenses.and.returnValue(of(null));
      component.readyToReportExpenses = cloneDeep(readyToReportExpensesData);
      component.selectedElements = cloneDeep([readyToReportExpensesData[0]]);
      fixture.detectChanges();

      component.ctaClickedEvent('create_draft_report');

      expect(component.sendFirstReportCreated).toHaveBeenCalledTimes(1);
      expect(spenderReportsService.createDraft).toHaveBeenCalledOnceWith({
        data: {
          purpose: component.reportTitle,
          source: 'MOBILE',
        },
      });
      expect(trackingService.createReport).toHaveBeenCalledOnceWith({
        Expense_Count: 1,
        Report_Value: component.selectedTotalAmount,
      });
      expect(spenderReportsService.addExpenses).toHaveBeenCalledOnceWith(expectedReportsSinglePage[0].id, [
        readyToReportExpensesData[0].id,
      ]);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_reports']);
    });

    it('should create a draft report', () => {
      component.selectedElements = [];
      fixture.detectChanges();

      component.ctaClickedEvent('create_draft_report');

      expect(component.sendFirstReportCreated).toHaveBeenCalledTimes(1);
      expect(spenderReportsService.createDraft).toHaveBeenCalledOnceWith({
        data: {
          purpose: component.reportTitle,
          source: 'MOBILE',
        },
      });
      expect(trackingService.createReport).toHaveBeenCalledOnceWith({
        Expense_Count: 0,
        Report_Value: component.selectedTotalAmount,
      });
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_reports']);
    });

    it('should create report', () => {
      spenderReportsService.create.and.returnValue(of(expectedReportsSinglePage[0]));
      component.selectedElements = cloneDeep(readyToReportExpensesData);
      fixture.detectChanges();

      component.ctaClickedEvent('submit_report');

      expect(component.sendFirstReportCreated).toHaveBeenCalledTimes(1);
      expect(spenderReportsService.create).toHaveBeenCalledOnceWith(
        {
          purpose: component.reportTitle,
          source: 'MOBILE',
        },
        [readyToReportExpensesData[0].id, readyToReportExpensesData[1].id],
      );
      expect(trackingService.createReport).toHaveBeenCalledOnceWith({
        Expense_Count: 2,
        Report_Value: component.selectedTotalAmount,
      });
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_reports']);
    });

    it('show report name error if there is no name', fakeAsync(() => {
      component.reportTitle = '';
      component.isLoading = false;
      component.selectedElements = [];
      component.emptyInput = true;
      fixture.detectChanges();

      component.ctaClickedEvent('submit_report');
      tick(500);

      expect(component.showReportNameError).toBeTrue();
    }));
  });

  describe('selectExpense():', () => {
    beforeEach(() => {
      spyOn(component, 'getReportTitle');
      component.readyToReportExpenses = [];
    });

    it('should add the expense in selected list', () => {
      component.selectedElements = cloneDeep([readyToReportExpensesData[1]]);
      component.selectExpense(readyToReportExpensesData[0]);

      expect(component.getReportTitle).toHaveBeenCalledTimes(1);
      expect(component.selectedElements.length).toEqual(2);
      expect(component.isSelectedAll).toBeFalse();
    });

    it('should remove an expense from the selected list', () => {
      component.selectedElements = cloneDeep(readyToReportExpensesData);
      component.selectExpense(readyToReportExpensesData[1]);

      expect(component.getReportTitle).toHaveBeenCalledTimes(1);
      expect(component.selectedElements.length).toEqual(1);
      expect(component.isSelectedAll).toBeFalse();
    });
  });

  describe('toggleSelectAll():', () => {
    beforeEach(() => {
      component.readyToReportExpenses = cloneDeep(readyToReportExpensesData);
      spyOn(component, 'getReportTitle');
      fixture.detectChanges();
    });

    it('should select all ready expenses', () => {
      component.toggleSelectAll(true);

      expect(component.selectedElements).toEqual(readyToReportExpensesData);
      expect(component.getReportTitle).toHaveBeenCalledTimes(1);
    });

    it('should unselect any expense in the selected expenses list', () => {
      component.toggleSelectAll(false);

      expect(component.selectedElements).toEqual([]);
      expect(component.getReportTitle).toHaveBeenCalledTimes(1);
    });
  });

  it('getReportTitle(): get report title', fakeAsync(() => {
    component.selectedElements = cloneDeep(readyToReportExpensesData);
    spyOn(component, 'getTotalSelectedExpensesAmount').and.returnValue(150);
    spenderReportsService.suggestPurpose.and.returnValue(of('#Sept 24'));
    component.isLoading = false;
    component.reportTitle = 'New Report';
    fixture.detectChanges();

    component.getReportTitle();
    tick(500);

    expect(spenderReportsService.suggestPurpose).toHaveBeenCalledOnceWith([
      readyToReportExpensesData[0].id,
      readyToReportExpensesData[1].id,
    ]);
    expect(component.reportTitle).toEqual('#Sept 24');
    expect(component.getTotalSelectedExpensesAmount).toHaveBeenCalledOnceWith(component.selectedElements);
  }));

  it('toggleTransaction(): should toggle selected transaction to unselected', () => {
    spyOn(component, 'getReportTitle');

    const mockSelectedExpense = cloneDeep(selectedExpense1);
    component.toggleTransaction(mockSelectedExpense);

    expect(mockSelectedExpense.isSelected).toBeFalse();
    expect(component.getReportTitle).toHaveBeenCalledTimes(1);
  });

  describe('checkTxnIds():', () => {
    it('should set selected txn IDs from route', () => {
      activatedRoute.snapshot.params.txn_ids = JSON.stringify([selectedExpenses[0].tx_id, selectedExpenses[1].tx_id]);
      fixture.detectChanges();

      component.checkTxnIds();

      expect(component.selectedExpenseIDs).toEqual([selectedExpenses[0].tx_id, null]);
    });

    it('should set selected txn IDs as empty array if not found in route', () => {
      activatedRoute.snapshot.params.txn_ids = null;
      fixture.detectChanges();

      component.checkTxnIds();

      expect(component.selectedExpenseIDs).toEqual([]);
    });
  });

  it('ionViewWillEnter(): should setup expenses', fakeAsync(() => {
    expensesService.getAllExpenses.and.returnValue(of(readyToReportExpensesData));
    orgSettingsService.get.and.returnValue(of(orgSettingsPendingRestrictions));
    spyOn(component, 'getReportTitle').and.returnValue(null);
    spyOn(component, 'checkTxnIds');
    component.selectedExpenseIDs = [selectedExpenses[0].tx_id];
    fixture.detectChanges();

    component.ionViewWillEnter();
    tick(500);

    expect(expensesService.getAllExpenses).toHaveBeenCalledOnceWith({
      queryParams: {
        report_id: 'is.null',
        state: 'in.(COMPLETE)',
        order: 'spent_at.desc',
        or: ['(policy_amount.is.null,policy_amount.gt.0.0001)'],
      },
    });
    expect(component.getReportTitle).toHaveBeenCalledTimes(1);

    expect(component.checkTxnIds).toHaveBeenCalledTimes(1);
  }));

  describe('ionViewWillEnter():', () => {
    beforeEach(() => {
      const mockSelectedExpense = cloneDeep(readyToReportExpensesData);
      mockSelectedExpense[0].matched_corporate_card_transaction_ids = [];
      mockSelectedExpense[1].matched_corporate_card_transactions[0].status = ExpenseTransactionStatus.PENDING;
      expensesService.getAllExpenses.and.returnValue(of(mockSelectedExpense));
      orgSettingsService.get.and.returnValue(of(orgSettingsPendingRestrictions));
      spyOn(component, 'getReportTitle').and.returnValue(null);
      spyOn(component, 'checkTxnIds');
      component.selectedExpenseIDs = [mockSelectedExpense[0].id, mockSelectedExpense[1].id];
      fixture.detectChanges();
    });

    it('ionViewWillEnter(): should setup expenses', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(500);

      expect(expensesService.getAllExpenses).toHaveBeenCalledOnceWith({
        queryParams: {
          report_id: 'is.null',
          state: 'in.(COMPLETE)',
          order: 'spent_at.desc',
          or: ['(policy_amount.is.null,policy_amount.gt.0.0001)'],
        },
      });
      expect(component.getReportTitle).toHaveBeenCalledTimes(1);

      expect(component.checkTxnIds).toHaveBeenCalledTimes(1);
      // Should filter out the pending expenses
      expect(component.selectedElements.length).toEqual(1);
    }));

    it('ionViewWillEnter(): should not filter expense if pending restriction is disabled', fakeAsync(() => {
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));

      component.ionViewWillEnter();
      tick(500);

      expect(expensesService.getAllExpenses).toHaveBeenCalledOnceWith({
        queryParams: {
          report_id: 'is.null',
          state: 'in.(COMPLETE)',
          order: 'spent_at.desc',
          or: ['(policy_amount.is.null,policy_amount.gt.0.0001)'],
        },
      });
      expect(component.getReportTitle).toHaveBeenCalledTimes(1);

      expect(component.checkTxnIds).toHaveBeenCalledTimes(1);

      // Should not filter out the pending expenses
      expect(component.selectedElements.length).toEqual(2);
    }));
  });

  describe('getTotalSelectedExpensesAmount()', () => {
    it('should return total amount', () => {
      expect(component.getTotalSelectedExpensesAmount(cloneDeep(readyToReportExpensesData2))).toEqual(200);
    });

    it('should return 0 if there are no re imbursable expenses', () => {
      expect(component.getTotalSelectedExpensesAmount([nonReimbursableExpense])).toEqual(0);
    });
  });
});
