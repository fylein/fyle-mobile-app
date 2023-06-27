import { TestBed } from '@angular/core/testing';
import { TeamReportsPage } from './team-reports.page';
import { ReportState } from 'src/app/shared/pipes/report-state.pipe';
import { IonicModule, ModalController } from '@ionic/angular';
import { NetworkService } from 'src/app/core/services/network.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ReportService } from 'src/app/core/services/report.service';
import { DateService } from 'src/app/core/services/date.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ApiV2Service } from 'src/app/core/services/api-v2.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { TestCases1 } from './team-reports-1.page.spec';

fdescribe('TeamReportsPage', () => {
  const getTestBed = () => {
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', ['getTeamReports', 'getTeamReportsCount', 'delete']);
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
    ]);
    const activatedRouteSpy = {
      snapshot: {
        params: {
          navigate_back: true,
        },
        queryParams: {},
      },
    };
    const apiV2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['extendQueryParamsForTextSearch']);
    const tasksServiceSpy = jasmine.createSpyObj('TasksService', ['getTeamReportsTaskCount']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);

    TestBed.configureTestingModule({
      declarations: [TeamReportsPage, ReportState],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: NetworkService, useValue: networkServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: ReportService, useValue: reportServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: DateService, useValue: dateServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: PopupService, useValue: popupServiceSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: ApiV2Service, useValue: apiV2ServiceSpy },
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
        ReportState,
      ],
    }).compileComponents();

    return TestBed;
  };

  TestCases1(getTestBed);
});
