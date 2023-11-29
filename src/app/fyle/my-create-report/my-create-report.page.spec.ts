import { CurrencyPipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { cloneDeep } from 'lodash';
import { of } from 'rxjs';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { selectedExpense1, selectedExpenses } from 'src/app/core/mock-data/expense.data';
import {
  expenseData,
  nonReimbursableExpense,
  readyToReportExpensesData,
  readyToReportExpensesData2,
} from 'src/app/core/mock-data/platform/v1/expense.data';
import { reportUnflattenedData } from 'src/app/core/mock-data/report-v1.data';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { RefinerService } from 'src/app/core/services/refiner.service';
import { ReportService } from 'src/app/core/services/report.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { StorageService } from '../../core/services/storage.service';
import { TrackingService } from '../../core/services/tracking.service';
import { MyCreateReportPage } from './my-create-report.page';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';

describe('MyCreateReportPage', () => {
  let component: MyCreateReportPage;
  let fixture: ComponentFixture<MyCreateReportPage>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let reportService: jasmine.SpyObj<ReportService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let router: jasmine.SpyObj<Router>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let refinerService: jasmine.SpyObj<RefinerService>;
  let expensesService: jasmine.SpyObj<ExpensesService>;

  beforeEach(waitForAsync(() => {
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['getAllExpenses']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', [
      'getMyReportsCount',
      'createDraft',
      'addTransactions',
      'create',
      'getReportPurpose',
    ]);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['createFirstReport', 'createReport']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const refinerServiceSpy = jasmine.createSpyObj('RefinerService', ['startSurvey']);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['getAllExpenses']);

    TestBed.configureTestingModule({
      declarations: [MyCreateReportPage, HumanizeCurrencyPipe],
      imports: [IonicModule.forRoot(), RouterTestingModule, FormsModule, MatCheckboxModule],
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
          provide: TransactionService,
          useValue: transactionServiceSpy,
        },
        {
          provide: ReportService,
          useValue: reportServiceSpy,
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
          provide: RefinerService,
          useValue: refinerServiceSpy,
        },
        {
          provide: ExpensesService,
          useValue: expensesServiceSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(MyCreateReportPage);
    component = fixture.componentInstance;

    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    refinerService = TestBed.inject(RefinerService) as jasmine.SpyObj<RefinerService>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;

    currencyService.getHomeCurrency.and.returnValue(of('USD'));
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
    reportService.getMyReportsCount.and.returnValue(of(0));
    spyOn(component, 'getTotalSelectedExpensesAmount').and.returnValue(150);
    component.readyToReportExpenses = [...readyToReportExpensesData, expenseData];
    component.selectedElements = readyToReportExpensesData;
    fixture.detectChanges();

    component.sendFirstReportCreated();
    tick(1000);

    expect(reportService.getMyReportsCount).toHaveBeenCalledOnceWith({});
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
      reportService.createDraft.and.returnValue(of(reportUnflattenedData));
    });

    it('should create a draft report and add transactions to it, if there are any selected expenses', () => {
      reportService.addTransactions.and.returnValue(of(null));
      component.readyToReportExpenses = cloneDeep(readyToReportExpensesData);
      component.selectedElements = cloneDeep([readyToReportExpensesData[0]]);
      fixture.detectChanges();

      component.ctaClickedEvent('create_draft_report');

      expect(component.sendFirstReportCreated).toHaveBeenCalledTimes(1);
      expect(reportService.createDraft).toHaveBeenCalledOnceWith({
        purpose: component.reportTitle,
        source: 'MOBILE',
      });
      expect(trackingService.createReport).toHaveBeenCalledOnceWith({
        Expense_Count: 1,
        Report_Value: component.selectedTotalAmount,
      });
      expect(reportService.addTransactions).toHaveBeenCalledOnceWith(reportUnflattenedData.id, [
        readyToReportExpensesData[0].id,
      ]);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_reports']);
    });

    it('should create a draft report', () => {
      component.selectedElements = [];
      fixture.detectChanges();

      component.ctaClickedEvent('create_draft_report');

      expect(component.sendFirstReportCreated).toHaveBeenCalledTimes(1);
      expect(reportService.createDraft).toHaveBeenCalledOnceWith({
        purpose: component.reportTitle,
        source: 'MOBILE',
      });
      expect(trackingService.createReport).toHaveBeenCalledOnceWith({
        Expense_Count: 0,
        Report_Value: component.selectedTotalAmount,
      });
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_reports']);
    });

    it('should create report', () => {
      reportService.create.and.returnValue(of(reportUnflattenedData));
      component.selectedElements = cloneDeep(readyToReportExpensesData);
      fixture.detectChanges();

      component.ctaClickedEvent('create_report');

      expect(component.sendFirstReportCreated).toHaveBeenCalledTimes(1);
      expect(reportService.create).toHaveBeenCalledOnceWith(
        {
          purpose: component.reportTitle,
          source: 'MOBILE',
        },
        [readyToReportExpensesData[0].id, readyToReportExpensesData[1].id]
      );
      expect(trackingService.createReport).toHaveBeenCalledOnceWith({
        Expense_Count: 2,
        Report_Value: component.selectedTotalAmount,
      });
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_reports']);
      expect(refinerService.startSurvey).toHaveBeenCalledOnceWith({ actionName: 'Submit Newly Created Report' });
    });

    it('show report name error if there is no name', fakeAsync(() => {
      const el = getElementBySelector(fixture, "[data-testid='report-name']") as HTMLInputElement;
      el.value = '';
      el.dispatchEvent(new Event('input'));

      tick(500);
      fixture.detectChanges();

      component.emptyInput = true;
      fixture.detectChanges();

      component.ctaClickedEvent('create_report');
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
    reportService.getReportPurpose.and.returnValue(of('#Sept 24'));
    const el = getElementBySelector(fixture, "[data-testid='report-name']") as HTMLInputElement;
    el.value = 'New Report';
    el.dispatchEvent(new Event('input'));

    tick(500);
    fixture.detectChanges();

    Object.defineProperty(component.reportTitleInput, 'dirty', {
      get: () => false,
    });

    component.getReportTitle();

    expect(reportService.getReportPurpose).toHaveBeenCalledOnceWith({
      ids: [readyToReportExpensesData[0].id, readyToReportExpensesData[1].id],
    });
    expect(component.reportTitle).toEqual('#Sept 24');
    expect(component.getTotalSelectedExpensesAmount).toHaveBeenCalledOnceWith(component.selectedElements);
  }));

  it('toggleTransaction(): should toggle selected transaction to unselected', () => {
    spyOn(component, 'getReportTitle');

    component.toggleTransaction(selectedExpense1);

    expect(selectedExpense1.isSelected).toBeFalse();
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
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();
    transactionService.getAllExpenses.and.returnValue(of(cloneDeep(selectedExpenses)));
    expensesService.getAllExpenses.and.returnValue(of(readyToReportExpensesData));
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
    expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
    expect(component.getReportTitle).toHaveBeenCalledTimes(1);

    expect(component.checkTxnIds).toHaveBeenCalledTimes(1);
  }));

  describe('getTotalSelectedExpensesAmount()', () => {
    it('should return total amount', () => {
      expect(component.getTotalSelectedExpensesAmount(cloneDeep(readyToReportExpensesData2))).toEqual(150);
    });

    it('should return 0 if there are no re imbursable expenses', () => {
      expect(component.getTotalSelectedExpensesAmount([nonReimbursableExpense])).toEqual(0);
    });
  });
});
