import { TestBed } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { TasksComponent } from './tasks.component';
import { TasksService } from 'src/app/core/services/tasks.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ReportService } from 'src/app/core/services/report.service';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NetworkService } from 'src/app/core/services/network.service';
import { RouterTestingModule } from '@angular/router/testing';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestCases1 } from './tasks-1.component.spec';
import { TestCases2 } from './tasks-2.component.spec';
import { TestCases3 } from './tasks-3.component.spec';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { ApproverReportsService } from 'src/app/core/services/platform/v1/approver/reports.service';

describe('TasksComponent', () => {
  const getTestBed = () => {
    const tasksServiceSpy = jasmine.createSpyObj('TasksService', [
      'getTasks',
      'generateFilterPills',
      'generateSelectedFilters',
      'convertFilters',
    ]);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', [
      'clearCache',
      'transformExpense',
      'transformRawExpense',
      'getAllExpenses',
    ]);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['getExpenseById', 'getAllExpenses']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', [
      'getReportAutoSubmissionDetails',
      'clearCache',
      'getMyReports',
      'getTeamReports',
      'addTransactions',
    ]);
    const advanceRequestServiceSpy = jasmine.createSpyObj('AdvanceRequestService', ['getSpenderAdvanceRequests']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'tasksShown',
      'tasksFiltersApplied',
      'tasksFilterPillClicked',
      'tasksFilterClearAllClicked',
      'tasksClicked',
      'duplicateTaskClicked',
      'showToastMessage',
      'autoSubmissionInfoCardClicked',
      'commuteDeductionTaskClicked',
      'commuteDeductionDetailsAddedFromSpenderTask',
    ]);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const matBottomSheetSpy = jasmine.createSpyObj('MatBottomSheet', ['open']);
    const spenderReportsServiceSpy = jasmine.createSpyObj('SpenderReportsService', [
      'addExpenses',
      'getAllReportsByParams',
    ]);
    const approverReportsServiceSpy = jasmine.createSpyObj('ApproverReportsService', ['getAllReportsByParams']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = {
      snapshot: {
        queryParams: {
          tasksFilters: 'none',
        },
      },
    };
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);

    TestBed.configureTestingModule({
      declarations: [TasksComponent],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: ReportService, useValue: reportServiceSpy },
        { provide: AdvanceRequestService, useValue: advanceRequestServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: MatBottomSheet, useValue: matBottomSheetSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: SnackbarPropertiesService, useValue: snackbarPropertiesSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: NetworkService, useValue: networkServiceSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
        { provide: ExpensesService, useValue: expensesServiceSpy },
        { provide: SpenderReportsService, useValue: spenderReportsServiceSpy },
        { provide: ApproverReportsService, useValue: approverReportsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    return TestBed;
  };

  TestCases1(getTestBed);
  TestCases2(getTestBed);
  TestCases3(getTestBed);
});
