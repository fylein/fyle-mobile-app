import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FyViewReportInfoComponent } from './fy-view-report-info.component';
import { reportParam } from 'src/app/core/mock-data/report.data';
import { expenseList } from 'src/app/core/mock-data/expense.data';
import { of } from 'rxjs';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { ModalController } from '@ionic/angular';
import { DatePipe, KeyValue } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { currencySummaryData } from 'src/app/core/mock-data/currency-summary.data';

fdescribe('FyViewReportInfoComponent', () => {
  let component: FyViewReportInfoComponent;
  let fixture: ComponentFixture<FyViewReportInfoComponent>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let authService: jasmine.SpyObj<AuthService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let datePipe: DatePipe;

  beforeEach(waitForAsync(() => {
    const mockTransactionServiceSpy = jasmine.createSpyObj('TransactionService', [
      'getPaymentModeWiseSummary',
      'getCurrenyWiseSummary',
    ]);
    const mockOrgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get']);
    const mockTrackingServiceSpy = jasmine.createSpyObj('TrackingService', ['viewReportInfo']);
    const mockAuthServiceSpy = jasmine.createSpyObj('AuthService', ['getUserDetails']);
    const mockOrgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const mockModalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

    TestBed.configureTestingModule({
      declarations: [FyViewReportInfoComponent],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionServiceSpy,
        },
        {
          provide: OrgUserSettingsService,
          useValue: mockOrgUserSettingsServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: mockTrackingServiceSpy,
        },
        {
          provide: AuthService,
          useValue: mockAuthServiceSpy,
        },

        {
          provide: OrgSettingsService,
          useValue: mockOrgSettingsServiceSpy,
        },
        {
          provide: ModalController,
          useValue: mockModalControllerSpy,
        },
        DatePipe,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FyViewReportInfoComponent);
    component = fixture.componentInstance;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    datePipe = TestBed.inject(DatePipe);
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    component.isReportView = true;
    component.isEmployeeView = false;
    component.isForeignCurrency = false;
    component.reportDetails = {};
    component.amountCurrencyWiseDetails = {};
    component.employeeDetails = {};
    component.isSwipe = false;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(): should do nothing', () => {
    spyOn(component, 'ngOnInit');
    component.ngOnInit();
  });

  it('ionViewWillEnter(): should update report details and currency and set Reimbursable according to paymentModeData', () => {
    component.view = ExpenseView.team;
    const erpt = {
      'Report Name': 'My Testing Report',
      Owner: 'Abhishek Jain',
      'Report Number': 'C/2022/10/R/37',
      'Created On': datePipe.transform(new Date('2022-10-31T13:54:46.317208'), 'MMM d, y'),
    };
    const paymentModeSummaryMock = {
      reimbursable: {
        name: 'example',
        key: 'key123',
        amount: 4600,
        count: 200,
      },
    };
    spyOn(component, 'createEmployeeDetails');
    spyOn(component, 'getCCCAdvanceSummary');
    orgSettingsService.get.and.returnValue(of(orgSettingsRes));
    transactionService.getCurrenyWiseSummary.and.returnValue(currencySummaryData);
    transactionService.getPaymentModeWiseSummary.and.returnValue(paymentModeSummaryMock);
    component.erpt$ = of(reportParam);
    component.etxns$ = of(expenseList);
    fixture.detectChanges();
    component.ionViewWillEnter();
    expect(component.reportDetails).toEqual(erpt);
    expect(component.reportCurrency).toEqual('USD');
    expect(component.createEmployeeDetails).toHaveBeenCalledOnceWith(reportParam);
    expect(component.amountComponentWiseDetails).toEqual({
      'Total Amount': 46040,
      Reimbursable: 4600,
    });
    expect(component.getCCCAdvanceSummary).toHaveBeenCalledOnceWith(paymentModeSummaryMock, orgSettingsRes);
    expect(transactionService.getCurrenyWiseSummary).toHaveBeenCalledOnceWith(expenseList);
    expect(component.amountCurrencyWiseDetails).toEqual(currencySummaryData);
    expect(component.isForeignCurrency).toBe(false);
  });

  it('ionViewWillEnter(): should update report details and currency and set Reimbursable to zero', () => {
    component.view = ExpenseView.team;
    const erpt = {
      'Report Name': 'My Testing Report',
      Owner: 'Abhishek Jain',
      'Report Number': 'C/2022/10/R/37',
      'Created On': datePipe.transform(new Date('2022-10-31T13:54:46.317208'), 'MMM d, y'),
    };
    const paymentModeSummaryMock = {
      ccc: {
        name: 'example',
        key: 'key123',
        amount: 4600,
        count: 200,
      },
    };
    spyOn(component, 'createEmployeeDetails');
    spyOn(component, 'getCCCAdvanceSummary');
    orgSettingsService.get.and.returnValue(of(orgSettingsRes));
    transactionService.getCurrenyWiseSummary.and.returnValue(currencySummaryData);
    transactionService.getPaymentModeWiseSummary.and.returnValue(paymentModeSummaryMock);
    component.erpt$ = of(reportParam);
    component.etxns$ = of(expenseList);
    fixture.detectChanges();
    component.ionViewWillEnter();
    expect(component.reportDetails).toEqual(erpt);
    expect(component.reportCurrency).toEqual('USD');
    expect(component.createEmployeeDetails).toHaveBeenCalledOnceWith(reportParam);
    expect(component.amountComponentWiseDetails).toEqual({
      'Total Amount': 46040,
      Reimbursable: 0,
    });
    expect(component.getCCCAdvanceSummary).toHaveBeenCalledOnceWith(paymentModeSummaryMock, orgSettingsRes);
    expect(transactionService.getCurrenyWiseSummary).toHaveBeenCalledOnceWith(expenseList);
    expect(component.amountCurrencyWiseDetails).toEqual(currencySummaryData);
    expect(component.isForeignCurrency).toBe(false);
  });

  it('should always return 0', () => {
    const a: KeyValue<string, any> = { key: 'test1', value: 'value1' };
    const b: KeyValue<string, any> = { key: 'test2', value: 'value2' };

    expect(component.originalOrder(a, b)).toEqual(0);
  });

  it('closeModal(): should dismiss the modal', () => {
    component.closeModal();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('segmentChanged(): should set the view based on the selected segment', () => {
    const event = { detail: { value: 'report' } };
    component.view = ExpenseView.team;
    fixture.detectChanges();

    component.segmentChanged(event);

    expect(component.isReportView).toBeTrue();
    expect(component.isEmployeeView).toBeFalse();

    event.detail.value = 'amount';
    component.segmentChanged(event);

    expect(component.isReportView).toBeFalse();
    expect(component.isEmployeeView).toBeFalse();

    event.detail.value = 'employee';
    component.segmentChanged(event);

    expect(component.isReportView).toBeFalse();
    expect(component.isEmployeeView).toBeTrue();
  });

  it('segmentChanged(): should track report info when segment is clicked', () => {
    const event = { detail: { value: 'report' } };

    component.segmentChanged(event);

    expect(trackingService.viewReportInfo).toHaveBeenCalledOnceWith({
      view: component.view,
      action: 'click',
      segment: 'report',
    });
  });

  it('segmentChanged(): should not track report info on swipe', () => {
    const event = { detail: { value: 'report' } };
    component.isSwipe = true;

    component.segmentChanged(event);

    expect(trackingService.viewReportInfo).not.toHaveBeenCalled();

    expect(component.isSwipe).toBeFalsy();
  });

  it('should call trackingService and click button on swipe right', () => {
    const app = fixture.nativeElement;
    const btn = app.getElementsByClassName('view-info--segment-block-container__btn')[1];
    const clickSpy = spyOn(btn, 'click');

    const event = {
      direction: 2,
    };
    component.onSwipeReport(event);

    expect(component.isSwipe).toBeTrue();
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(trackingService.viewReportInfo).toHaveBeenCalledOnceWith({
      view: component.view,
      action: 'swipe',
      segment: 'report',
    });
  });

  it('onSwipeAmount(): should handle click event for event direction - 4', () => {
    const app = fixture.nativeElement;
    const btn0spy = spyOn(app.getElementsByClassName('view-info--segment-block-container__btn')[0], 'click');
    component.view = ExpenseView.individual;
    component.onSwipeAmount({ direction: 4 });
    expect(btn0spy).toHaveBeenCalledTimes(1);

    expect(component.isSwipe).toBeTruthy();
    expect(trackingService.viewReportInfo).toHaveBeenCalledOnceWith({
      view: component.view,
      action: 'swipe',
      segment: 'amount',
    });
  });

  it('onSwipeAmount(): should handle click event for event direction - 2', () => {
    const app = fixture.nativeElement;
    component.view = ExpenseView.team;
    fixture.detectChanges();
    const btn2Spy = spyOn(app.getElementsByClassName('view-info--segment-block-container__btn')[2], 'click');
    component.onSwipeAmount({ direction: 2 });

    expect(btn2Spy).toHaveBeenCalledTimes(1);
    expect(component.isSwipe).toBeTruthy();
    expect(trackingService.viewReportInfo).toHaveBeenCalledOnceWith({
      view: component.view,
      action: 'swipe',
      segment: 'amount',
    });
  });
});
