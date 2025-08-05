import { ComponentFixture, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ModalController, PopoverController } from '@ionic/angular';

import { TasksComponent } from './tasks.component';
import { TasksService } from 'src/app/core/services/tasks.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
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
import { publicAdvanceRequestRes, singleExtendedAdvReqRes } from 'src/app/core/mock-data/extended-advance-request.data';
import {
  expensesList,
  mileageCategoryPlatformExpenseData,
  perDiemCategoryPlatformExpenseData,
  platformExpenseData,
} from 'src/app/core/mock-data/platform/v1/expense.data';
import {
  mileageCategoryTransformedExpenseData,
  perDiemCategoryTransformedExpenseData,
  transformedExpenseData,
} from 'src/app/core/mock-data/transformed-expense.data';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { ApproverReportsService } from 'src/app/core/services/platform/v1/approver/reports.service';
import { expectedReportsSinglePage } from 'src/app/core/mock-data/platform-report.data';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { OrgService } from 'src/app/core/services/org.service';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { FyOptInComponent } from 'src/app/shared/components/fy-opt-in/fy-opt-in.component';
import { Component, Input } from '@angular/core';
import { AddCorporateCardComponent } from '../../manage-corporate-cards/add-corporate-card/add-corporate-card.component';
import { By } from '@angular/platform-browser';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { CardAddedComponent } from '../../manage-corporate-cards/card-added/card-added.component';
import { orgSettingsPendingRestrictions } from 'src/app/core/mock-data/org-settings.data';
import { employeeSettingsData } from 'src/app/core/mock-data/employee-settings.data';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';

export function TestCases2(getTestBed) {
  return describe('test case set 2', () => {
    let component: TasksComponent;
    let fixture: ComponentFixture<TasksComponent>;
    let tasksService: jasmine.SpyObj<TasksService>;
    let transactionService: jasmine.SpyObj<TransactionService>;
    let expensesService: jasmine.SpyObj<ExpensesService>;
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
    let spenderReportsService: jasmine.SpyObj<SpenderReportsService>;
    let approverReportsService: jasmine.SpyObj<ApproverReportsService>;
    let orgService: jasmine.SpyObj<OrgService>;
    let popoverController: jasmine.SpyObj<PopoverController>;
    let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
    let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;
    let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
    let translocoService: jasmine.SpyObj<TranslocoService>;
    beforeEach(waitForAsync(() => {
      const TestBed = getTestBed();
      TestBed.configureTestingModule({
        declarations: [TasksComponent],
        imports: [TranslocoModule],
      });
      fixture = TestBed.createComponent(TasksComponent);
      component = fixture.componentInstance;
      tasksService = TestBed.inject(TasksService) as jasmine.SpyObj<TasksService>;
      transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
      expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
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
      spenderReportsService = TestBed.inject(SpenderReportsService) as jasmine.SpyObj<SpenderReportsService>;
      approverReportsService = TestBed.inject(ApproverReportsService) as jasmine.SpyObj<ApproverReportsService>;
      orgService = TestBed.inject(OrgService) as jasmine.SpyObj<OrgService>;
      popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
      platformEmployeeSettingsService = TestBed.inject(
        PlatformEmployeeSettingsService
      ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
      corporateCreditCardExpenseService = TestBed.inject(
        CorporateCreditCardExpenseService
      ) as jasmine.SpyObj<CorporateCreditCardExpenseService>;
      let addCardPopoverSpy: jasmine.SpyObj<HTMLIonPopoverElement>;
      popoverController.create.and.returnValues(Promise.resolve(addCardPopoverSpy));
      orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
      networkService.isOnline.and.returnValue(of(true));
      networkService.connectivityWatcher.and.returnValue(null);
      translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
      translocoService.translate.and.callFake((key: any, params?: any) => {
        const translations: { [key: string]: string } = {
          'tasks.expenses': 'Expenses',
          'tasks.complete': 'Complete',
          'tasks.draft': 'Draft',
          'tasks.duplicate': 'Duplicate',
          'tasks.reports': 'Reports',
          'tasks.sentBack': 'Sent Back',
          'tasks.unsubmitted': 'Unsubmitted',
          'tasks.unapproved': 'Unapproved',
          'tasks.advances': 'Advances',
          'tasks.loadingExpenses': 'please wait while we load your expenses',
          'tasks.openingReport': 'Opening your report...',
          'tasks.openingAdvance': 'Opening your advance request...',
          'tasks.addingExpenseToReport': 'Adding expense to report',
          'tasks.viewReport': 'View Report',
          'tasks.expensesAddedToDraft': 'Expenses added to an existing draft report',
          'tasks.expensesAddedSuccessfully': 'Expenses added to report successfully',
          'tasks.commuteDetailsSaved': 'Commute details saved successfully',
          'tasks.noTasks': 'You have no tasks right now',
          'tasks.noTasksFiltered': 'You have no tasks',
          'tasks.matchingFilters': 'matching the applied filters',
        };
        let translation = translations[key] || key;
        if (params) {
          Object.keys(params).forEach((key) => {
            translation = translation.replace(`{{${key}}}`, params[key]);
          });
        }
        return translation;
      });
    }));

    describe('init():', () => {
      beforeEach(() => {
        reportService.getReportAutoSubmissionDetails.and.returnValue(of(apiReportAutoSubmissionDetails));
        orgService.getCurrentOrg.and.returnValue(of(orgData1[0]));
        orgService.getPrimaryOrg.and.returnValue(of(orgData1[0]));
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
          expect(tasksService.getTasks).toHaveBeenCalledWith(true, component.loadData$.getValue(), true);
          expect(component.trackTasks).toHaveBeenCalledTimes(2);
          expect(component.taskCount).toEqual(dashboardTasksData.length);
          expect(res).toEqual(dashboardTasksData);
        });
      });

      it('should set showReportAutoSubmissionInfoCard to true if autoSubmissionReportDate is defined, no expenses are incomplete and filter is not equal to team_reports', () => {
        component.init();
        expect(component.showReportAutoSubmissionInfoCard).toBeTrue();
      });

      it('should set showReportAutoSubmissionInfoCard to false if autoSubmissionReportDate is defined, no expenses are incomplete and filter is equal to team_reports', () => {
        activatedRoute.snapshot.queryParams = { tasksFilters: 'team_reports' };
        component.init();
        expect(component.showReportAutoSubmissionInfoCard).toBeFalse();
      });

      it('should set all parameters to false in loadData and call generateFilterPills if filter is none', () => {
        component.init();
        const loadDataValue = component.loadData$.getValue();
        expect(loadDataValue).toEqual(taskFiltersData2);
        expect(tasksService.generateFilterPills).toHaveBeenCalledOnceWith(loadDataValue);
        expect(component.filterPills).toEqual([typeFilterPill]);
      });

      it('should set draftExpenses, unreportedExpenses and potentialDuplicates to true in loadData and call generateFilterPills if filter is expenses', () => {
        activatedRoute.snapshot.queryParams = { tasksFilters: 'expenses' };
        component.init();
        const loadDataValue = component.loadData$.getValue();
        expect(loadDataValue).toEqual(taskFiltersParams4);
        expect(tasksService.generateFilterPills).toHaveBeenCalledOnceWith(loadDataValue);
        expect(component.filterPills).toEqual([typeFilterPill]);
      });

      it('should set draftReports and sentBackReports to true in loadData and call generateFilterPills if filter is reports', () => {
        activatedRoute.snapshot.queryParams = { tasksFilters: 'reports' };
        component.init();
        const loadDataValue = component.loadData$.getValue();
        expect(loadDataValue).toEqual(taskFiltersParams5);
        expect(tasksService.generateFilterPills).toHaveBeenCalledOnceWith(loadDataValue);
        expect(component.filterPills).toEqual([typeFilterPill]);
      });

      it('should set teamReports to true in loadData and call generateFilterPills if filter is team_reports', () => {
        activatedRoute.snapshot.queryParams = { tasksFilters: 'team_reports' };
        component.init();
        const loadDataValue = component.loadData$.getValue();
        expect(loadDataValue).toEqual(taskFiltersParams6);
        expect(tasksService.generateFilterPills).toHaveBeenCalledOnceWith(loadDataValue);
        expect(component.filterPills).toEqual([typeFilterPill]);
      });

      it('should set sentBackAdvances to true in loadData and call generateFilterPills if filter is advances', () => {
        activatedRoute.snapshot.queryParams = { tasksFilters: 'advances' };
        component.init();
        const loadDataValue = component.loadData$.getValue();
        expect(loadDataValue).toEqual(taskFiltersParams7);
        expect(tasksService.generateFilterPills).toHaveBeenCalledOnceWith(loadDataValue);
        expect(component.filterPills).toEqual([typeFilterPill]);
      });
    });

    describe('onAddCorporateCardClick(): ', () => {
      it('should open card popover', () => {
        orgSettingsService.get.and.returnValue(of(orgSettingsPendingRestrictions));
        platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));
        const addCardPopoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onDidDismiss']);
        addCardPopoverSpy.present.and.resolveTo();
        addCardPopoverSpy.onDidDismiss.and.resolveTo({ data: { success: true } });
        popoverController.create.and.resolveTo(addCardPopoverSpy);
        spyOn(component, 'handleEnrollmentSuccess');

        fixture.detectChanges();
        component.onAddCorporateCardClick();
        expect(popoverController.create).toHaveBeenCalledOnceWith({
          component: AddCorporateCardComponent,
          cssClass: 'fy-dialog-popover',
          componentProps: {
            isVisaRTFEnabled: true,
            isMastercardRTFEnabled: true,
            isYodleeEnabled: true,
          },
        });
      });

      it('should not open card popover when success is undefined', () => {
        orgSettingsService.get.and.returnValue(of(orgSettingsPendingRestrictions));
        platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));
        const addCardPopoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onDidDismiss']);
        addCardPopoverSpy.present.and.resolveTo();
        addCardPopoverSpy.onDidDismiss.and.resolveTo({ data: null });
        popoverController.create.and.resolveTo(addCardPopoverSpy);
        const enrollmentSuccessSpy = spyOn(component, 'handleEnrollmentSuccess');

        fixture.detectChanges();
        component.onAddCorporateCardClick();
        expect(enrollmentSuccessSpy).not.toHaveBeenCalled();
      });
    });

    it('handleEnrollmentSuccess(): should handle enrollment success and trigger subsequent actions', fakeAsync(() => {
      spyOn(component, 'doRefresh');
      corporateCreditCardExpenseService.clearCache.and.returnValue(of(null));

      const mockPopover = {
        present: jasmine.createSpy('present').and.resolveTo(),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.resolveTo(),
      };
      popoverController.create.and.resolveTo(mockPopover as any);

      component.handleEnrollmentSuccess();
      tick();

      expect(corporateCreditCardExpenseService.clearCache).toHaveBeenCalled();
      expect(popoverController.create).toHaveBeenCalledWith({
        component: CardAddedComponent,
        cssClass: 'pop-up-in-center',
      });
      expect(mockPopover.present).toHaveBeenCalled();
    }));

    it('onMobileNumberVerificationTaskClick(): should open opt in modal', fakeAsync(() => {
      authService.getEou.and.resolveTo(apiEouRes);
      const optInModalSpy = jasmine.createSpyObj('optInModal', ['present', 'onWillDismiss']);
      optInModalSpy.onWillDismiss.and.resolveTo({ data: { action: 'SUCCESS' } });
      modalController.create.and.returnValue(optInModalSpy);
      spyOn(component, 'doRefresh');

      component.onMobileNumberVerificationTaskClick();
      tick(100);

      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: FyOptInComponent,
        componentProps: {
          extendedOrgUser: apiEouRes,
        },
      });
      expect(optInModalSpy.present).toHaveBeenCalledTimes(1);
      expect(optInModalSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(component.doRefresh).toHaveBeenCalledTimes(1);
      expect(trackingService.optedInFromTasks).toHaveBeenCalledTimes(1);
    }));

    describe('onReviewExpensesTaskClick():', () => {
      beforeEach(() => {
        loaderService.showLoader.and.resolveTo();
        loaderService.hideLoader.and.resolveTo();
        expensesService.getAllExpenses.and.returnValue(of(cloneDeep(expensesList)));
        expensesService.getExpenseById.and.returnValue(of(platformExpenseData));
        transactionService.transformExpense.and.returnValue(transformedExpenseData);
      });

      it('should get all expenses and navigate to add_edit_mileage if category is of type mileage', fakeAsync(() => {
        expensesService.getAllExpenses.and.returnValue(of([mileageCategoryPlatformExpenseData]));
        transactionService.transformExpense.and.returnValue(mileageCategoryTransformedExpenseData);

        component.onReviewExpensesTaskClick();
        tick(100);
        expect(loaderService.showLoader).toHaveBeenCalledOnceWith('please wait while we load your expenses', 3000);
        expect(expensesService.getAllExpenses).toHaveBeenCalledOnceWith({
          queryParams: {
            state: 'in.(DRAFT)',
            report_id: 'is.null',
          },
        });
        expect(transactionService.transformExpense).toHaveBeenCalledOnceWith(mileageCategoryPlatformExpenseData);
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'add_edit_mileage',
          {
            id: mileageCategoryTransformedExpenseData.tx.id,
            txnIds: '["txvslh8aQMbu"]',
            activeIndex: 0,
            navigate_back: true,
          },
        ]);
      }));

      it('should get all expenses and navigate to add_edit_per_diem if category is of type per diem', fakeAsync(() => {
        expensesService.getAllExpenses.and.returnValue(of([perDiemCategoryPlatformExpenseData]));
        transactionService.transformExpense.and.returnValue(perDiemCategoryTransformedExpenseData);
        component.onReviewExpensesTaskClick();
        tick(100);
        expect(loaderService.showLoader).toHaveBeenCalledOnceWith('please wait while we load your expenses', 3000);
        expect(expensesService.getAllExpenses).toHaveBeenCalledOnceWith({
          queryParams: {
            state: 'in.(DRAFT)',
            report_id: 'is.null',
          },
        });
        expect(transactionService.transformExpense).toHaveBeenCalledOnceWith(perDiemCategoryPlatformExpenseData);
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'add_edit_per_diem',
          {
            id: perDiemCategoryTransformedExpenseData.tx.id,
            txnIds: '["txvslh8aQMbu"]',
            activeIndex: 0,
            navigate_back: true,
          },
        ]);
      }));

      it('should get all expenses and navigate to add_edit_expense if category is other than mileage or per diem', fakeAsync(() => {
        expensesService.getAllExpenses.and.returnValue(of([platformExpenseData]));
        transactionService.transformExpense.and.returnValue(transformedExpenseData);
        component.onReviewExpensesTaskClick();
        tick(100);
        expect(loaderService.showLoader).toHaveBeenCalledOnceWith('please wait while we load your expenses', 3000);
        expect(expensesService.getAllExpenses).toHaveBeenCalledOnceWith({
          queryParams: {
            state: 'in.(DRAFT)',
            report_id: 'is.null',
          },
        });
        expect(transactionService.transformExpense).toHaveBeenCalledOnceWith(platformExpenseData);
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'add_edit_mileage',
          {
            id: mileageCategoryTransformedExpenseData.tx.id,
            txnIds: '["txvslh8aQMbu"]',
            activeIndex: 0,
            navigate_back: true,
          },
        ]);
      }));
    });

    describe('onSentBackReportTaskClick():', () => {
      beforeEach(() => {
        loaderService.showLoader.and.resolveTo();
        loaderService.hideLoader.and.resolveTo();
        spenderReportsService.getAllReportsByParams.and.returnValue(of(expectedReportsSinglePage));
      });

      it('should get all reports and navigate to my view report page if task count is 1', fakeAsync(() => {
        const mockDashboardTasksData = cloneDeep(dashboardTasksData);
        mockDashboardTasksData[0].count = 1;
        component.onSentBackReportTaskClick(taskCtaData3, mockDashboardTasksData[0]);
        tick(100);
        expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Opening your report...');
        expect(spenderReportsService.getAllReportsByParams).toHaveBeenCalledOnceWith({
          state: 'eq.APPROVER_INQUIRY',
          offset: 0,
          limit: 1,
        });
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'my_view_report',
          { id: expectedReportsSinglePage[0].id },
        ]);
      }));

      it('should navigate to my reports page if task count is greater than 1', fakeAsync(() => {
        component.onSentBackReportTaskClick(taskCtaData3, dashboardTasksData[0]);
        tick(100);
        expect(loaderService.showLoader).not.toHaveBeenCalled();
        expect(spenderReportsService.getAllReportsByParams).not.toHaveBeenCalled();
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
        advanceRequestService.getSpenderAdvanceRequests.and.returnValue(of(publicAdvanceRequestRes));
      });

      it('should get all advances and navigate to add edit advance request page if task count is 1', fakeAsync(() => {
        const mockDashboardTasksData = cloneDeep(dashboardTasksData);
        mockDashboardTasksData[0].count = 1;
        component.onSentBackAdvanceTaskClick(taskCtaData3, mockDashboardTasksData[0]);
        tick(100);
        expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Opening your advance request...');
        expect(advanceRequestService.getSpenderAdvanceRequests).toHaveBeenCalledOnceWith({
          queryParams: {
            state: 'eq.SENT_BACK',
          },
          offset: 0,
          limit: 1,
        });
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'add_edit_advance_request',
          { id: publicAdvanceRequestRes.data[0].areq_id },
        ]);
      }));

      it('should navigate to my advances page if task count is greater than 1', fakeAsync(() => {
        component.onSentBackAdvanceTaskClick(taskCtaData3, dashboardTasksData[0]);
        tick(100);
        expect(loaderService.showLoader).not.toHaveBeenCalled();
        expect(advanceRequestService.getSpenderAdvanceRequests).not.toHaveBeenCalled();
        expect(loaderService.hideLoader).not.toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_advances'], {
          queryParams: { filters: JSON.stringify({ state: ['SENT_BACK'] }) },
        });
      }));
    });

    describe('onTeamReportsTaskClick():', () => {
      beforeEach(() => {
        loaderService.showLoader.and.resolveTo();
        loaderService.hideLoader.and.resolveTo();
        authService.getEou.and.resolveTo(apiEouRes);
        approverReportsService.getAllReportsByParams.and.returnValue(of(expectedReportsSinglePage));
      });

      it('should get all team reports and navigate to my view report page if task count is 1', fakeAsync(() => {
        const mockDashboardTasksData = cloneDeep(dashboardTasksData);
        mockDashboardTasksData[0].count = 1;
        component.onTeamReportsTaskClick(taskCtaData3, mockDashboardTasksData[0]);
        tick(100);
        expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Opening your report...');
        expect(approverReportsService.getAllReportsByParams).toHaveBeenCalledOnceWith({
          state: 'eq.APPROVER_PENDING',
          next_approver_user_ids: `cs.[${apiEouRes.us.id}]`,
        });
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'view_team_report',
          { id: expectedReportsSinglePage[0].id, navigate_back: true },
        ]);
      }));

      it('should navigate to my reports page if task count is greater than 1', fakeAsync(() => {
        component.onTeamReportsTaskClick(taskCtaData3, dashboardTasksData[0]);
        tick(100);
        expect(loaderService.showLoader).not.toHaveBeenCalled();
        expect(approverReportsService.getAllReportsByParams).not.toHaveBeenCalled();
        expect(loaderService.hideLoader).not.toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'team_reports'], {
          queryParams: { filters: JSON.stringify({ state: ['APPROVER_PENDING'] }) },
        });
      }));
    });

    describe('onOpenDraftReportsTaskClick():', () => {
      beforeEach(() => {
        loaderService.showLoader.and.resolveTo();
        loaderService.hideLoader.and.resolveTo();
        spenderReportsService.getAllReportsByParams.and.returnValue(of(expectedReportsSinglePage));
      });

      it('should get all reports and navigate to my view report page if task count is 1', fakeAsync(() => {
        const mockDashboardTasksData = cloneDeep(dashboardTasksData);
        mockDashboardTasksData[0].count = 1;
        component.onOpenDraftReportsTaskClick(taskCtaData3, mockDashboardTasksData[0]);
        tick(100);
        expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Opening your report...');
        expect(spenderReportsService.getAllReportsByParams).toHaveBeenCalledOnceWith({
          state: 'eq.DRAFT',
          offset: 0,
          limit: 1,
        });
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'my_view_report',
          { id: expectedReportsSinglePage[0].id },
        ]);
      }));

      it('should navigate to my reports page if task count is greater than 1', fakeAsync(() => {
        component.onOpenDraftReportsTaskClick(taskCtaData3, dashboardTasksData[0]);
        tick(100);
        expect(loaderService.showLoader).not.toHaveBeenCalled();
        expect(spenderReportsService.getAllReportsByParams).not.toHaveBeenCalled();
        expect(loaderService.hideLoader).not.toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_reports'], {
          queryParams: { filters: JSON.stringify({ state: ['DRAFT'] }) },
        });
      }));
    });
  });
}
