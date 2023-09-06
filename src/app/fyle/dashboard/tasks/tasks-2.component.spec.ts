import { ComponentFixture, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';

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
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { of } from 'rxjs';
import { apiReportAutoSubmissionDetails } from 'src/app/core/mock-data/report-auto-submission-details.data';
import { dashboardTasksData } from 'src/app/core/mock-data/dashboard-task.data';
import { typeFilterPill } from 'src/app/core/mock-data/filter-pills.data';
import {
  taskFiltersData2,
  taskFiltersParams4,
  taskFiltersParams5,
  taskFiltersParams6,
  taskFiltersParams7,
} from 'src/app/core/mock-data/task-filters.data';
import { taskCtaData3, taskCtaData9 } from 'src/app/core/mock-data/task-cta.data';
import { expenseList } from 'src/app/core/mock-data/expense.data';
import { cloneDeep } from 'lodash';
import {
  mileageCategoryUnflattenedExpense,
  perDiemCategoryUnflattenedExpense,
  unflattenedTxnData,
} from 'src/app/core/mock-data/unflattened-txn.data';
import { apiReportRes } from 'src/app/core/mock-data/api-reports.data';
import { singleExtendedAdvReqRes } from 'src/app/core/mock-data/extended-advance-request.data';

export function TestCases2(getTestBed) {
  return describe('test case set 2', () => {
    let component: TasksComponent;
    let fixture: ComponentFixture<TasksComponent>;
    let tasksService: jasmine.SpyObj<TasksService>;
    let transactionService: jasmine.SpyObj<TransactionService>;
    let reportService: jasmine.SpyObj<ReportService>;
    let advanceRequestService: jasmine.SpyObj<AdvanceRequestService>;
    let modalController: jasmine.SpyObj<ModalController>;
    let trackingService: jasmine.SpyObj<TrackingService>;
    let loaderService: jasmine.SpyObj<LoaderService>;
    let matBottomSheet: jasmine.SpyObj<MatBottomSheet>;
    let matSnackBar: jasmine.SpyObj<MatSnackBar>;
    let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
    let authService: jasmine.SpyObj<AuthService>;
    let router: jasmine.SpyObj<Router>;
    let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
    let networkService: jasmine.SpyObj<NetworkService>;

    beforeEach(waitForAsync(() => {
      const TestBed = getTestBed();
      fixture = TestBed.createComponent(TasksComponent);
      component = fixture.componentInstance;
      tasksService = TestBed.inject(TasksService) as jasmine.SpyObj<TasksService>;
      transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
      reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
      advanceRequestService = TestBed.inject(AdvanceRequestService) as jasmine.SpyObj<AdvanceRequestService>;
      modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
      trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
      loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
      matBottomSheet = TestBed.inject(MatBottomSheet) as jasmine.SpyObj<MatBottomSheet>;
      matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
      snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
      authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
      networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    }));

    describe('init():', () => {
      beforeEach(() => {
        reportService.getReportAutoSubmissionDetails.and.returnValue(of(apiReportAutoSubmissionDetails));
        tasksService.getTasks.and.returnValue(of(dashboardTasksData));
        spyOn(component, 'trackTasks');
        tasksService.generateFilterPills.and.returnValue([typeFilterPill]);
      });

      it('should set autoSubmissionReportDate$', () => {
        component.init();
        component.autoSubmissionReportDate$.subscribe((res) => {
          expect(reportService.getReportAutoSubmissionDetails).toHaveBeenCalledTimes(1);
          expect(res).toEqual(apiReportAutoSubmissionDetails.data.next_at);
        });
      });

      it('should call trackTasks and set taskCount equals to total tasks', () => {
        component.init();
        component.tasks$.subscribe((res) => {
          // Called 2 times as tasks$ will update again because we are changing loadData$ value
          expect(tasksService.getTasks).toHaveBeenCalledTimes(2);
          expect(tasksService.getTasks).toHaveBeenCalledWith(true, component.loadData$.getValue());
          expect(component.trackTasks).toHaveBeenCalledTimes(2);
          expect;
          expect(component.taskCount).toEqual(dashboardTasksData.length);
          expect(res).toEqual(dashboardTasksData);
        });
      });

      it('should set showReportAutoSubmissionInfoCard to true if autoSubmissionReportDate is defined, no expenses are incomplete and filter is not equal to team_reports', () => {
        component.init();
        expect(component.showReportAutoSubmissionInfoCard).toBeTrue();
      });

      it('should set showReportAutoSubmissionInfoCard to false if autoSubmissionReportDate is filter is equal to team_reports', () => {
        activatedRoute.snapshot.queryParams = { tasksFilters: 'team_reports' };
        component.init();
        expect(component.showReportAutoSubmissionInfoCard).toBeFalse();
      });

      it('should set loadData and filterPills accordingly if filter applied is none', () => {
        component.init();
        const loadDataValue = component.loadData$.getValue();
        expect(loadDataValue).toEqual(taskFiltersData2);
        expect(tasksService.generateFilterPills).toHaveBeenCalledOnceWith(loadDataValue);
        expect(component.filterPills).toEqual([typeFilterPill]);
      });

      it('should set loadData and filterPills accordingly if filter is expenses', () => {
        activatedRoute.snapshot.queryParams = { tasksFilters: 'expenses' };
        component.init();
        const loadDataValue = component.loadData$.getValue();
        expect(loadDataValue).toEqual(taskFiltersParams4);
        expect(tasksService.generateFilterPills).toHaveBeenCalledOnceWith(loadDataValue);
        expect(component.filterPills).toEqual([typeFilterPill]);
      });

      it('should set loadData and filterPills accordingly if filter is reports', () => {
        activatedRoute.snapshot.queryParams = { tasksFilters: 'reports' };
        component.init();
        const loadDataValue = component.loadData$.getValue();
        expect(loadDataValue).toEqual(taskFiltersParams5);
        expect(tasksService.generateFilterPills).toHaveBeenCalledOnceWith(loadDataValue);
        expect(component.filterPills).toEqual([typeFilterPill]);
      });

      it('should set loadData and filterPills accordingly if filter is team_reports', () => {
        activatedRoute.snapshot.queryParams = { tasksFilters: 'team_reports' };
        component.init();
        const loadDataValue = component.loadData$.getValue();
        expect(loadDataValue).toEqual(taskFiltersParams6);
        expect(tasksService.generateFilterPills).toHaveBeenCalledOnceWith(loadDataValue);
        expect(component.filterPills).toEqual([typeFilterPill]);
      });

      it('should set loadData and filterPills accordingly if filter is advances', () => {
        activatedRoute.snapshot.queryParams = { tasksFilters: 'advances' };
        component.init();
        const loadDataValue = component.loadData$.getValue();
        expect(loadDataValue).toEqual(taskFiltersParams7);
        expect(tasksService.generateFilterPills).toHaveBeenCalledOnceWith(loadDataValue);
        expect(component.filterPills).toEqual([typeFilterPill]);
      });
    });

    describe('onMobileNumberVerificationTaskClick():', () => {
      it('should navigate to my profile page', () => {
        component.onMobileNumberVerificationTaskClick(taskCtaData9);
        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'my_profile',
          { openPopover: 'verify_mobile_number' },
        ]);
      });

      it('should navigate to my profile page with add_mobile_number popover if content is Add', () => {
        component.onMobileNumberVerificationTaskClick({ ...taskCtaData9, content: 'Add' });
        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'my_profile',
          { openPopover: 'add_mobile_number' },
        ]);
      });
    });

    describe('onReviewExpensesTaskClick():', () => {
      beforeEach(() => {
        loaderService.showLoader.and.resolveTo();
        loaderService.hideLoader.and.resolveTo();
        transactionService.getAllExpenses.and.returnValue(of(cloneDeep(expenseList)));
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));
      });

      it('should get all expenses and navigate to add_edit_mileage if category is of type mileage', fakeAsync(() => {
        transactionService.getETxnUnflattened.and.returnValue(of(mileageCategoryUnflattenedExpense));
        component.onReviewExpensesTaskClick();
        tick(100);
        expect(loaderService.showLoader).toHaveBeenCalledOnceWith('please wait while we load your expenses', 3000);
        expect(transactionService.getAllExpenses).toHaveBeenCalledOnceWith({
          queryParams: {
            tx_state: 'in.(DRAFT)',
            tx_report_id: 'is.null',
          },
        });
        expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(expenseList[0].tx_id);
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'add_edit_mileage',
          { id: mileageCategoryUnflattenedExpense.tx.id, txnIds: '["txBphgnCHHeO"]', activeIndex: 0 },
        ]);
      }));

      it('should get all expenses and navigate to add_edit_per_diem if category is of type per diem', fakeAsync(() => {
        transactionService.getETxnUnflattened.and.returnValue(of(perDiemCategoryUnflattenedExpense));
        component.onReviewExpensesTaskClick();
        tick(100);
        expect(loaderService.showLoader).toHaveBeenCalledOnceWith('please wait while we load your expenses', 3000);
        expect(transactionService.getAllExpenses).toHaveBeenCalledOnceWith({
          queryParams: {
            tx_state: 'in.(DRAFT)',
            tx_report_id: 'is.null',
          },
        });
        expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(expenseList[0].tx_id);
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'add_edit_per_diem',
          { id: mileageCategoryUnflattenedExpense.tx.id, txnIds: '["txBphgnCHHeO"]', activeIndex: 0 },
        ]);
      }));

      it('should get all expenses and navigate to add_edit_expense if category is other than mileage or per diem', fakeAsync(() => {
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));
        component.onReviewExpensesTaskClick();
        tick(100);
        expect(loaderService.showLoader).toHaveBeenCalledOnceWith('please wait while we load your expenses', 3000);
        expect(transactionService.getAllExpenses).toHaveBeenCalledOnceWith({
          queryParams: {
            tx_state: 'in.(DRAFT)',
            tx_report_id: 'is.null',
          },
        });
        expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(expenseList[0].tx_id);
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'add_edit_expense',
          { id: mileageCategoryUnflattenedExpense.tx.id, txnIds: '["txBphgnCHHeO"]', activeIndex: 0 },
        ]);
      }));
    });

    describe('onSentBackReportTaskClick():', () => {
      beforeEach(() => {
        loaderService.showLoader.and.resolveTo();
        loaderService.hideLoader.and.resolveTo();
        reportService.getMyReports.and.returnValue(of(apiReportRes));
      });

      it('should get all reports and navigate to my view report page if task count is 1', fakeAsync(() => {
        const mockDashboardTasksData = cloneDeep(dashboardTasksData);
        mockDashboardTasksData[0].count = 1;
        component.onSentBackReportTaskClick(taskCtaData3, mockDashboardTasksData[0]);
        tick(100);
        expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Opening your report...');
        expect(reportService.getMyReports).toHaveBeenCalledOnceWith({
          queryParams: {
            rp_state: 'in.(APPROVER_INQUIRY)',
          },
          offset: 0,
          limit: 1,
        });
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'my_view_report',
          { id: apiReportRes.data[0].rp_id },
        ]);
      }));

      it('should navigate to my reports page if task count is greater than 1', fakeAsync(() => {
        component.onSentBackReportTaskClick(taskCtaData3, dashboardTasksData[0]);
        tick(100);
        expect(loaderService.showLoader).not.toHaveBeenCalled();
        expect(reportService.getMyReports).not.toHaveBeenCalled();
        expect(loaderService.hideLoader).not.toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_reports'], {
          queryParams: { filters: '{"state":["APPROVER_INQUIRY"]}' },
        });
      }));
    });

    describe('onSentBackAdvanceTaskClick():', () => {
      beforeEach(() => {
        loaderService.showLoader.and.resolveTo();
        loaderService.hideLoader.and.resolveTo();
        advanceRequestService.getMyadvanceRequests.and.returnValue(of(singleExtendedAdvReqRes));
      });

      it('should get all advances and navigate to add edit advance request page if task count is 1', fakeAsync(() => {
        const mockDashboardTasksData = cloneDeep(dashboardTasksData);
        mockDashboardTasksData[0].count = 1;
        component.onSentBackAdvanceTaskClick(taskCtaData3, mockDashboardTasksData[0]);
        tick(100);
        expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Opening your advance request...');
        expect(advanceRequestService.getMyadvanceRequests).toHaveBeenCalledOnceWith({
          queryParams: {
            areq_state: 'in.(DRAFT)',
            areq_is_sent_back: 'is.true',
          },
          offset: 0,
          limit: 1,
        });
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'add_edit_advance_request',
          { id: singleExtendedAdvReqRes.data[0].areq_id },
        ]);
      }));

      it('should navigate to my advances page if task count is greater than 1', fakeAsync(() => {
        component.onSentBackAdvanceTaskClick(taskCtaData3, dashboardTasksData[0]);
        tick(100);
        expect(loaderService.showLoader).not.toHaveBeenCalled();
        expect(advanceRequestService.getMyadvanceRequests).not.toHaveBeenCalled();
        expect(loaderService.hideLoader).not.toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_advances'], {
          queryParams: { filters: '{"state":["SENT_BACK"]}' },
        });
      }));
    });

    describe('onTeamReportsTaskClick():', () => {
      beforeEach(() => {
        loaderService.showLoader.and.resolveTo();
        loaderService.hideLoader.and.resolveTo();
        reportService.getTeamReports.and.returnValue(of(apiReportRes));
      });

      it('should get all team reports and navigate to my view report page if task count is 1', fakeAsync(() => {
        const mockDashboardTasksData = cloneDeep(dashboardTasksData);
        mockDashboardTasksData[0].count = 1;
        component.onTeamReportsTaskClick(taskCtaData3, mockDashboardTasksData[0]);
        tick(100);
        expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Opening your report...');
        expect(reportService.getTeamReports).toHaveBeenCalledOnceWith({
          queryParams: {
            rp_approval_state: ['in.(APPROVAL_PENDING)'],
            rp_state: ['in.(APPROVER_PENDING)'],
            sequential_approval_turn: ['in.(true)'],
          },
          offset: 0,
          limit: 1,
        });
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'view_team_report',
          { id: apiReportRes.data[0].rp_id, navigate_back: true },
        ]);
      }));

      it('should navigate to my reports page if task count is greater than 1', fakeAsync(() => {
        component.onTeamReportsTaskClick(taskCtaData3, dashboardTasksData[0]);
        tick(100);
        expect(loaderService.showLoader).not.toHaveBeenCalled();
        expect(reportService.getTeamReports).not.toHaveBeenCalled();
        expect(loaderService.hideLoader).not.toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'team_reports'], {
          queryParams: { filters: '{"state":["APPROVER_PENDING"]}' },
        });
      }));
    });

    describe('onOpenDraftReportsTaskClick():', () => {
      beforeEach(() => {
        loaderService.showLoader.and.resolveTo();
        loaderService.hideLoader.and.resolveTo();
        reportService.getMyReports.and.returnValue(of(apiReportRes));
      });

      it('should get all reports and navigate to my view report page if task count is 1', fakeAsync(() => {
        const mockDashboardTasksData = cloneDeep(dashboardTasksData);
        mockDashboardTasksData[0].count = 1;
        component.onOpenDraftReportsTaskClick(taskCtaData3, mockDashboardTasksData[0]);
        tick(100);
        expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Opening your report...');
        expect(reportService.getMyReports).toHaveBeenCalledOnceWith({
          queryParams: {
            rp_state: 'in.(DRAFT)',
          },
          offset: 0,
          limit: 1,
        });
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'my_view_report',
          { id: apiReportRes.data[0].rp_id },
        ]);
      }));

      it('should navigate to my reports page if task count is greater than 1', fakeAsync(() => {
        component.onOpenDraftReportsTaskClick(taskCtaData3, dashboardTasksData[0]);
        tick(100);
        expect(loaderService.showLoader).not.toHaveBeenCalled();
        expect(reportService.getMyReports).not.toHaveBeenCalled();
        expect(loaderService.hideLoader).not.toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_reports'], {
          queryParams: { filters: '{"state":["DRAFT"]}' },
        });
      }));
    });
  });
}
