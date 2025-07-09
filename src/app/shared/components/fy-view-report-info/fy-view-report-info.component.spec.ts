import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';

import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { FyViewReportInfoComponent } from './fy-view-report-info.component';
import { of } from 'rxjs';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/approver/employee-settings.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { ModalController, SegmentCustomEvent } from '@ionic/angular';
import { DatePipe, KeyValue } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { currencySummaryData } from 'src/app/core/mock-data/currency-summary.data';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { costCentersData } from 'src/app/core/mock-data/cost-centers.data';
import { cloneDeep } from 'lodash';
import { expenseResponseData, expenseResponseData2 } from 'src/app/core/mock-data/platform/v1/expense.data';
import { ExpensesService as SharedExpensesService } from 'src/app/core/services/platform/v1/shared/expenses.service';
import { platformReportData } from 'src/app/core/mock-data/platform-report.data';

describe('FyViewReportInfoComponent', () => {
  let component: FyViewReportInfoComponent;
  let fixture: ComponentFixture<FyViewReportInfoComponent>;
  let sharedExpensesService: jasmine.SpyObj<SharedExpensesService>;
  let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let authService: jasmine.SpyObj<AuthService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let datePipe: DatePipe;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const mockPlatformEmployeeSettingsServiceSpy = jasmine.createSpyObj('PlatformEmployeeSettingsService', [
      'get',
      'getAllowedCostCentersByEmployeeId',
    ]);
    const mockSharedExpensesServiceSpy = jasmine.createSpyObj('SharedExpensesService', [
      'getPaymentModeWiseSummary',
      'getCurrenyWiseSummary',
    ]);
    const mockTrackingServiceSpy = jasmine.createSpyObj('TrackingService', ['viewReportInfo']);
    const mockAuthServiceSpy = jasmine.createSpyObj('AuthService', ['getUserDetails', 'getEou']);
    const mockOrgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const mockModalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [TranslocoModule],
      declarations: [FyViewReportInfoComponent],
      providers: [
        {
          provide: SharedExpensesService,
          useValue: mockSharedExpensesServiceSpy,
        },
        {
          provide: PlatformEmployeeSettingsService,
          useValue: mockPlatformEmployeeSettingsServiceSpy,
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
        { provide: TranslocoService, useValue: translocoServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FyViewReportInfoComponent);
    component = fixture.componentInstance;
    sharedExpensesService = TestBed.inject(SharedExpensesService) as jasmine.SpyObj<SharedExpensesService>;
    datePipe = TestBed.inject(DatePipe);
    platformEmployeeSettingsService = TestBed.inject(
      PlatformEmployeeSettingsService
    ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
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
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyViewReportInfo.viewInfo': 'View info',
        'fyViewReportInfo.report': 'Report',
        'fyViewReportInfo.amount': 'Amount',
        'fyViewReportInfo.employee': 'Employee',
        'fyViewReportInfo.reportName': 'Report Name',
        'fyViewReportInfo.owner': 'Owner',
        'fyViewReportInfo.reportNumber': 'Report Number',
        'fyViewReportInfo.createdDate': 'Created date',
        'fyViewReportInfo.totalAmount': 'Total Amount',
        'fyViewReportInfo.reimbursable': 'Reimbursable',
        'fyViewReportInfo.employeeId': 'Employee ID',
        'fyViewReportInfo.organization': 'Organization',
        'fyViewReportInfo.department': 'Department',
        'fyViewReportInfo.subDepartment': 'Sub Department',
        'fyViewReportInfo.location': 'Location',
        'fyViewReportInfo.level': 'Level',
        'fyViewReportInfo.employeeTitle': 'Employee Title',
        'fyViewReportInfo.businessUnit': 'Business Unit',
        'fyViewReportInfo.mobile': 'Mobile',
        'fyViewReportInfo.allowedCostCenters': 'Allowed Cost Centers',
        'fyViewReportInfo.ccc': 'CCC',
        'fyViewReportInfo.advance': 'Advance',
        'fyViewReportInfo.componentWiseSplit': 'Component wise split',
        'fyViewReportInfo.nonReimbursable': 'Non-reimbursable',
        'fyViewReportInfo.currencyWiseSplit': 'Currency wise split',
        'fyViewReportInfo.oneExpense': '1 Expense',
        'fyViewReportInfo.expenses': ' Expenses',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ionViewWillEnter(): should update report details and currency and set Reimbursable according to paymentModeData', () => {
    component.view = ExpenseView.team;
    const report = {
      'Report Name': '#3:  Jul 2023 - Office expense',
      Owner: 'Abhishek Jain',
      'Report Number': 'C/2023/07/R/17',
      'Created date': datePipe.transform(new Date('2023-07-11T13:54:46.317208'), 'MMM d, y'),
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
    sharedExpensesService.getCurrenyWiseSummary.and.returnValue(currencySummaryData);
    sharedExpensesService.getPaymentModeWiseSummary.and.returnValue(paymentModeSummaryMock);
    component.report$ = of({ ...platformReportData, amount: 46040 });
    component.expenses$ = of(expenseResponseData);
    fixture.detectChanges();
    component.ionViewWillEnter();
    expect(component.reportDetails).toEqual(report);
    expect(component.reportCurrency).toEqual('USD');
    expect(component.createEmployeeDetails).toHaveBeenCalledOnceWith({ ...platformReportData, amount: 46040 });
    expect(component.amountComponentWiseDetails).toEqual({
      'Total Amount': 46040,
      Reimbursable: 4600,
    });
    expect(component.getCCCAdvanceSummary).toHaveBeenCalledOnceWith(paymentModeSummaryMock, orgSettingsRes);
    expect(sharedExpensesService.getCurrenyWiseSummary).toHaveBeenCalledOnceWith(expenseResponseData);
    expect(component.amountCurrencyWiseDetails).toEqual(currencySummaryData);
    expect(component.isForeignCurrency).toBeFalse();
  });

  it('ionViewWillEnter(): should update report details and currency and set Reimbursable amount', () => {
    component.view = ExpenseView.team;
    const report = {
      'Report Name': '#3:  Jul 2023 - Office expense',
      Owner: 'Abhishek Jain',
      'Report Number': 'C/2023/07/R/17',
      'Created date': datePipe.transform(new Date('2023-07-11T16:24:01.335Z'), 'MMM d, y'),
    };
    const paymentModeSummaryMock = {
      reimbursable: {
        name: 'Reimbursable',
        key: 'reimbursable',
        amount: 207000.78,
        count: 200,
      },
    };
    spyOn(component, 'createEmployeeDetails');
    spyOn(component, 'getCCCAdvanceSummary');
    orgSettingsService.get.and.returnValue(of(orgSettingsRes));
    sharedExpensesService.getCurrenyWiseSummary.and.returnValue(currencySummaryData);
    sharedExpensesService.getPaymentModeWiseSummary.and.returnValue(paymentModeSummaryMock);
    component.report$ = of(platformReportData);
    component.expenses$ = of(expenseResponseData2);
    fixture.detectChanges();
    component.ionViewWillEnter();
    expect(component.reportDetails).toEqual(report);
    expect(component.reportCurrency).toEqual('USD');
    expect(component.createEmployeeDetails).toHaveBeenCalledOnceWith(platformReportData);
    expect(component.amountComponentWiseDetails).toEqual({
      'Total Amount': 0,
      Reimbursable: 207000.78,
    });
    expect(component.getCCCAdvanceSummary).toHaveBeenCalledOnceWith(paymentModeSummaryMock, orgSettingsRes);
    expect(sharedExpensesService.getCurrenyWiseSummary).toHaveBeenCalledOnceWith(expenseResponseData2);
    expect(component.amountCurrencyWiseDetails).toEqual(currencySummaryData);
    expect(component.isForeignCurrency).toBeFalse();
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

  it('onSwipeEmployee(): should call trackingService and click button on swipe event with direction 4', () => {
    const app = fixture.nativeElement;
    const btnSpy = spyOn(app.getElementsByClassName('view-info--segment-block-container__btn')[1], 'click');

    component.onSwipeEmployee({ direction: 4 });
    expect(component.isSwipe).toBeTrue();
    expect(trackingService.viewReportInfo).toHaveBeenCalledOnceWith({
      view: component.view,
      action: 'swipe',
      segment: 'employee',
    });
    expect(btnSpy).toHaveBeenCalledTimes(1);
  });

  describe('createEmployeeDetails():', () => {
    it('should update employee details', fakeAsync(() => {
      const expectedEmployeeDetails = {
        'Employee ID': platformReportData.employee.code,
        Organization: platformReportData.employee.org_name,
        Department: platformReportData.employee.department.name,
        'Sub Department': platformReportData.employee.department.sub_department,
        Location: platformReportData.employee.location,
        Level: platformReportData.employee.level,
        'Employee Title': platformReportData.employee.title,
        'Business Unit': platformReportData.employee.business_unit,
        Mobile: platformReportData.employee.mobile,
      };

      const expectedAllowedCostCenters = 'SMS1, test cost, cost centers mock data 1, cost center service 2';

      authService.getEou.and.resolveTo(apiEouRes);
      platformEmployeeSettingsService.getAllowedCostCentersByEmployeeId.and.returnValue(of(costCentersData));
      component.createEmployeeDetails(platformReportData);
      expect(component.employeeDetails).toEqual(expectedEmployeeDetails);
      tick(1000);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(platformEmployeeSettingsService.getAllowedCostCentersByEmployeeId).toHaveBeenCalledOnceWith(
        platformReportData.employee.id
      );
      expect(component.employeeDetails['Allowed Cost Centers']).toEqual(expectedAllowedCostCenters);
    }));

    it('should update employee details but not update the cost centers when API throw an error', fakeAsync(() => {
      const expectedEmployeeDetails = {
        'Employee ID': platformReportData.employee.code,
        Organization: platformReportData.employee.org_name,
        Department: platformReportData.employee.department?.name,
        'Sub Department': platformReportData.employee.department.sub_department,
        Location: platformReportData.employee.location,
        Level: platformReportData.employee.level?.name,
        'Employee Title': platformReportData.employee.title,
        'Business Unit': platformReportData.employee.business_unit,
        Mobile: platformReportData.employee.mobile,
      };

      const expectedAllowedCostCenters = 'SMS1, test cost, cost centers mock data 1, cost center service 2';

      authService.getEou.and.throwError('An Error Occured');
      component.createEmployeeDetails(platformReportData);
      expect(component.employeeDetails).toEqual(expectedEmployeeDetails);
      tick(1000);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(platformEmployeeSettingsService.getAllowedCostCentersByEmployeeId).not.toHaveBeenCalledOnceWith(
        platformReportData.employee.id
      );
      expect(component.employeeDetails['Allowed Cost Centers']).not.toEqual(expectedAllowedCostCenters);
    }));

    it('should have undefined when employee department and level values are undefined', fakeAsync(() => {
      const modifiedPlatformReportData = {
        ...platformReportData,
        employee: {
          ...platformReportData.employee,
          level: null,
          department: null,
        },
      };
      const expectedEmployeeDetails = {
        'Employee ID': modifiedPlatformReportData.employee.code,
        Organization: modifiedPlatformReportData.employee.org_name,
        Department: undefined,
        'Sub Department': undefined,
        Location: modifiedPlatformReportData.employee.location,
        Level: undefined,
        'Employee Title': modifiedPlatformReportData.employee.title,
        'Business Unit': modifiedPlatformReportData.employee.business_unit,
        Mobile: modifiedPlatformReportData.employee.mobile,
      };

      const expectedAllowedCostCenters = 'SMS1, test cost, cost centers mock data 1, cost center service 2';

      authService.getEou.and.resolveTo(apiEouRes);
      platformEmployeeSettingsService.getAllowedCostCentersByEmployeeId.and.returnValue(of(costCentersData));
      component.createEmployeeDetails(modifiedPlatformReportData);
      expect(component.employeeDetails).toEqual(expectedEmployeeDetails);
      tick(1000);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(platformEmployeeSettingsService.getAllowedCostCentersByEmployeeId).toHaveBeenCalledOnceWith(
        modifiedPlatformReportData.employee.id
      );
      expect(component.employeeDetails['Allowed Cost Centers']).toEqual(expectedAllowedCostCenters);
    }));
  });

  it('getCCCAdvanceSummary(): should update amountComponentWiseDetails', () => {
    const paymentModeSummaryMock = {
      ccc: {
        name: 'example',
        key: 'key123',
        amount: 4600,
        count: 200,
      },
      advance: {
        name: 'example',
        key: 'key123',
        amount: 4700,
        count: 200,
      },
    };
    component.amountComponentWiseDetails = {
      'Total Amount': platformReportData.amount,
      Reimbursable: 0,
    };
    component.getCCCAdvanceSummary(paymentModeSummaryMock, orgSettingsRes);
    expect(component.amountComponentWiseDetails.CCC).toBe(4600);
    expect(component.amountComponentWiseDetails.Advance).toBe(4700);
  });

  it('getCCCAdvanceSummary(): should update amountComponentWiseDetails if paymentModeWiseData dont have amount in ccc', () => {
    const paymentModeSummaryMock = {
      advance: {
        name: 'example',
        key: 'key123',
        amount: 4700,
        count: 200,
      },
    };
    component.amountComponentWiseDetails = {
      'Total Amount': platformReportData.amount,
      Reimbursable: 0,
    };
    component.getCCCAdvanceSummary(paymentModeSummaryMock, orgSettingsRes);
    expect(component.amountComponentWiseDetails.CCC).toBe(0);
    expect(component.amountComponentWiseDetails.Advance).toBe(4700);
  });

  it('getCCCAdvanceSummary(): should update amountComponentWiseDetails if paymentModeWiseData dont have amount in advance', () => {
    const paymentModeSummaryMock = {};
    component.amountComponentWiseDetails = {
      'Total Amount': platformReportData.amount,
      Reimbursable: 0,
    };
    component.getCCCAdvanceSummary(paymentModeSummaryMock, orgSettingsRes);
    expect(component.amountComponentWiseDetails.CCC).toBe(0);
    expect(component.amountComponentWiseDetails.Advance).toBe(0);
  });

  it('getCCCAdvanceSummary(): should not set Advance property of amountComponentWiseDetails if isAdvanceEnabled and isAdvanceRequestEnabled are both false', () => {
    const paymentModeSummaryMock = {
      ccc: {
        name: 'example',
        key: 'key123',
        amount: 4600,
        count: 200,
      },
      advance: {
        name: 'example',
        key: 'key123',
        amount: 4700,
        count: 200,
      },
    };
    component.amountComponentWiseDetails = {
      'Total Amount': platformReportData.amount,
      Reimbursable: 0,
    };
    const orgSettingsRes2 = cloneDeep(orgSettingsRes);
    orgSettingsRes2.advances.enabled = false;
    orgSettingsRes2.advance_requests.enabled = false;
    component.getCCCAdvanceSummary(paymentModeSummaryMock, orgSettingsRes2);
    expect(component.amountComponentWiseDetails.CCC).toBe(4600);
    expect(component.amountComponentWiseDetails.Advance).toBeUndefined();
  });
});
