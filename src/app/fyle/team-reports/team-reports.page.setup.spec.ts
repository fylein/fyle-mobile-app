import { TestBed } from '@angular/core/testing';
import { TeamReportsPage } from './team-reports.page';
import { ReportState } from 'src/app/shared/pipes/report-state.pipe';
import { IonicModule, ModalController } from '@ionic/angular';
import { NetworkService } from 'src/app/core/services/network.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { DateService } from 'src/app/core/services/date.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExtendQueryParamsService } from 'src/app/core/services/extend-query-params.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { TestCases1 } from './team-reports-1.page.spec';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestCases2 } from './team-reports-2.page.spec';
import { TestCases3 } from './team-reports-3.page.spec';
import { TestCases4 } from './team-reports-4.page.spec';
import { ApproverReportsService } from 'src/app/core/services/platform/v1/approver/reports.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { LaunchDarklyService } from '../../core/services/launch-darkly.service';

describe('TeamReportsPage', () => {
  const getTestBed = () => {
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', [
      'getThisMonthRange',
      'getThisWeekRange',
      'getLastMonthRange',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'footerHomeTabClicked',
      'TeamReportsFilterApplied',
      'tasksPageOpened',
    ]);
    const activatedRouteSpy = {
      snapshot: {
        params: {
          navigate_back: true,
        },
        queryParams: {},
      },
    };
    const extendQueryParamsServiceSpy = jasmine.createSpyObj('ExtendQueryParamsService', [
      'extendQueryParamsForTextSearch',
    ]);
    const tasksServiceSpy = jasmine.createSpyObj('TasksService', ['getTeamReportsTaskCount']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const approverReportsServiceSpy = jasmine.createSpyObj('ApproverReportsService', [
      'getReportsByParams',
      'getReportsCount',
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const launchDarklyServiceSpy = jasmine.createSpyObj('LaunchDarklyService', ['getVariation']);
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), TeamReportsPage, ReportState],
    providers: [
        { provide: NetworkService, useValue: networkServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: DateService, useValue: dateServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: PopupService, useValue: popupServiceSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: ExtendQueryParamsService, useValue: extendQueryParamsServiceSpy },
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
        { provide: ApproverReportsService, useValue: approverReportsServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: LaunchDarklyService, useValue: launchDarklyServiceSpy },
        ReportState,
    ],
    schemas: [NO_ERRORS_SCHEMA],
}).compileComponents();

    return TestBed;
  };

  TestCases1(getTestBed);
  TestCases2(getTestBed);
  TestCases3(getTestBed);
  TestCases4(getTestBed);
});
