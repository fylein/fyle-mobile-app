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
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { AuthService } from 'src/app/core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NetworkService } from 'src/app/core/services/network.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { dashboardTasksData } from 'src/app/core/mock-data/dashboard-task.data';
import { BehaviorSubject, of } from 'rxjs';
import {
  taskFiltersData,
  taskFiltersData2,
  taskFiltersParams,
  taskFiltersParams2,
  taskFiltersParams3,
} from 'src/app/core/mock-data/task-filters.data';
import { before, cloneDeep } from 'lodash';
import { TaskFilters } from 'src/app/core/models/task-filters.model';
import { taskFiltersPills } from 'src/app/core/mock-data/filter-pills.data';
import { taskSelectedFiltersData } from 'src/app/core/mock-data/selected-filters.data';
import { FyFiltersComponent } from 'src/app/shared/components/fy-filters/fy-filters.component';
import { taskModalControllerParams, taskModalControllerParams2 } from 'src/app/core/mock-data/modal-controller.data';
import {
  taskCtaData,
  taskCtaData2,
  taskCtaData3,
  taskCtaData4,
  taskCtaData5,
  taskCtaData6,
  taskCtaData7,
  taskCtaData8,
  taskCtaData9,
} from 'src/app/core/mock-data/task-cta.data';

export function TestCases1(getTestBed) {
  return describe('test case set 1', () => {
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

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('ngOnInit(): should call setupNetworkWatcher once', () => {
      spyOn(component, 'setupNetworkWatcher');
      fixture.detectChanges();

      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
    });

    describe('trackTasks(): ', () => {
      it('should call trackingService.tasksShown for each of the tasks', () => {
        component.trackTasks(dashboardTasksData);
        expect(trackingService.tasksShown).toHaveBeenCalledTimes(4);
        expect(trackingService.tasksShown).toHaveBeenCalledWith({
          Asset: 'Mobile',
          header: '77 Potential Duplicates',
        });
        expect(trackingService.tasksShown).toHaveBeenCalledWith({
          Asset: 'Mobile',
          header: 'Reports sent back!',
        });
        expect(trackingService.tasksShown).toHaveBeenCalledWith({
          Asset: 'Mobile',
          header: 'Expenses are ready to report',
        });
        expect(trackingService.tasksShown).toHaveBeenCalledWith({
          Asset: 'Mobile',
          header: 'Reports to be approved',
        });
      });

      it('should not call trackingService.tasksShown if tasks are null', () => {
        component.trackTasks(null);
        expect(trackingService.tasksShown).not.toHaveBeenCalled();
      });
    });

    describe('setupNetworkWatcher():', () => {
      it('should set isConnected to true if device is online', () => {
        networkService.isOnline.and.returnValue(of(true));

        component.setupNetworkWatcher();
        expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(1);
        expect(networkService.isOnline).toHaveBeenCalledTimes(1);
        component.isConnected$.subscribe((isConnected) => {
          expect(isConnected).toBeTrue();
        });
      });

      it('should set isConnected to false if device is offline', () => {
        networkService.isOnline.and.returnValue(of(false));

        component.setupNetworkWatcher();
        expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(1);
        expect(networkService.isOnline).toHaveBeenCalledTimes(1);
        component.isConnected$.subscribe((isConnected) => {
          expect(isConnected).toBeFalse();
        });
      });
    });

    describe('doRefresh(): ', () => {
      beforeEach(() => {
        transactionService.clearCache.and.returnValue(of(null));
        reportService.clearCache.and.returnValue(of(null));
        component.loadData$ = new BehaviorSubject({
          sentBackReports: false,
          draftReports: false,
          draftExpenses: false,
          unreportedExpenses: false,
          potentialDuplicates: false,
          teamReports: false,
          sentBackAdvances: false,
        });
      });

      it('should refresh page content if target is defined', fakeAsync(() => {
        const mockEvent = { target: { complete: jasmine.createSpy('complete') } };
        const nextMethod = spyOn(component.loadData$, 'next');
        component.doRefresh(mockEvent);
        expect(transactionService.clearCache).toHaveBeenCalledTimes(1);
        expect(reportService.clearCache).toHaveBeenCalledTimes(1);
        expect(nextMethod).toHaveBeenCalledTimes(1);

        tick(1500);
        expect(mockEvent.target.complete).toHaveBeenCalledTimes(1);
      }));

      it('should not refresh page content if target is undefined', fakeAsync(() => {
        const mockEvent = {};
        const nextMethod = spyOn(component.loadData$, 'next');
        component.doRefresh(mockEvent);
        expect(transactionService.clearCache).toHaveBeenCalledTimes(1);
        expect(reportService.clearCache).toHaveBeenCalledTimes(1);
        expect(nextMethod).toHaveBeenCalledTimes(1);

        tick(1500);
      }));

      it('should not refresh page content if event is not passed as an argument', fakeAsync(() => {
        const nextMethod = spyOn(component.loadData$, 'next');
        component.doRefresh();
        expect(transactionService.clearCache).toHaveBeenCalledTimes(1);
        expect(reportService.clearCache).toHaveBeenCalledTimes(1);
        expect(nextMethod).toHaveBeenCalledTimes(1);

        tick(1500);
      }));
    });

    describe('applyFilters(): ', () => {
      it('should update loadData if filters are passed as arguments', (done) => {
        component.applyFilters(taskFiltersData);
        component.loadData$.subscribe((data) => {
          expect(data).toEqual(taskFiltersData);
          done();
        });
      });

      it('should not update loadData$ if filters are not passed', () => {
        const nextMethod = spyOn(component.loadData$, 'next');
        component.applyFilters();

        expect(nextMethod).toHaveBeenCalledOnceWith(component.loadData$.getValue());
      });
    });

    describe('openFilters(): ', () => {
      beforeEach(() => {
        spyOn(component, 'applyFilters').and.callThrough();
        tasksService.convertFilters.and.returnValue(taskFiltersData);
        tasksService.generateFilterPills.and.returnValue(taskFiltersPills);
        tasksService.generateSelectedFilters.and.returnValue(taskSelectedFiltersData);
        const filterPopoverSpy = jasmine.createSpyObj('filterPopover', ['present', 'onWillDismiss']);
        filterPopoverSpy.onWillDismiss.and.resolveTo({ data: taskSelectedFiltersData });
        modalController.create.and.resolveTo(filterPopoverSpy);
        component.loadData$ = new BehaviorSubject(taskFiltersData);
      });

      it('should open modalController and call applyFilters if activeFilterName is passed as an argument', fakeAsync(() => {
        component.openFilters('Expenses');
        tick(500);

        expect(modalController.create).toHaveBeenCalledOnceWith(taskModalControllerParams);
        expect(tasksService.generateSelectedFilters).toHaveBeenCalledOnceWith(taskFiltersData);
        expect(tasksService.convertFilters).toHaveBeenCalledOnceWith(taskSelectedFiltersData);
        expect(component.applyFilters).toHaveBeenCalledOnceWith(taskFiltersData);
        expect(tasksService.generateFilterPills).toHaveBeenCalledOnceWith(taskFiltersData);
        expect(component.filterPills).toEqual(taskFiltersPills);
        expect(trackingService.tasksFiltersApplied).toHaveBeenCalledOnceWith({
          ...taskFiltersData,
        });
      }));

      it('should open modalController and call applyFilters if activeFilterName is not passed as an argument', fakeAsync(() => {
        component.openFilters();
        tick(500);

        expect(modalController.create).toHaveBeenCalledOnceWith(taskModalControllerParams2);
        expect(tasksService.generateSelectedFilters).toHaveBeenCalledOnceWith(taskFiltersData);
        expect(tasksService.convertFilters).toHaveBeenCalledOnceWith(taskSelectedFiltersData);
        expect(component.applyFilters).toHaveBeenCalledOnceWith(taskFiltersData);
        expect(tasksService.generateFilterPills).toHaveBeenCalledOnceWith(taskFiltersData);
        expect(component.filterPills).toEqual(taskFiltersPills);
        expect(trackingService.tasksFiltersApplied).toHaveBeenCalledOnceWith({
          ...taskFiltersData,
        });
      }));
    });

    describe('onFilterClose(): ', () => {
      beforeEach(() => {
        const mockTaskFiltersData = cloneDeep(taskFiltersData);
        component.loadData$ = new BehaviorSubject(mockTaskFiltersData);
        spyOn(component, 'applyFilters').and.callThrough();
        tasksService.generateFilterPills.and.returnValue(taskFiltersPills);
      });

      it('should set draftExpenses, unreportedExpenses and potentialDuplicates to false if filterPill type is Expenses', () => {
        component.onFilterClose('Expenses');
        expect(component.applyFilters).toHaveBeenCalledOnceWith(taskFiltersParams);
        expect(tasksService.generateFilterPills).toHaveBeenCalledOnceWith(taskFiltersParams);
        expect(component.filterPills).toEqual(taskFiltersPills);
        expect(trackingService.tasksFilterPillClicked).toHaveBeenCalledOnceWith({
          Asset: 'Mobile',
          filterPillType: 'Expenses',
        });
      });

      it('should set draftReports and sentBackReports to false if filterPill type is Reports', () => {
        component.onFilterClose('Reports');
        expect(component.applyFilters).toHaveBeenCalledOnceWith(taskFiltersParams2);
        expect(tasksService.generateFilterPills).toHaveBeenCalledOnceWith(taskFiltersParams2);
        expect(component.filterPills).toEqual(taskFiltersPills);
        expect(trackingService.tasksFilterPillClicked).toHaveBeenCalledOnceWith({
          Asset: 'Mobile',
          filterPillType: 'Reports',
        });
      });

      it('should set sentBackAdvances to false if filterPill type is Advances', () => {
        component.onFilterClose('Advances');
        expect(component.applyFilters).toHaveBeenCalledOnceWith(taskFiltersParams3);
        expect(tasksService.generateFilterPills).toHaveBeenCalledOnceWith(taskFiltersParams3);
        expect(component.filterPills).toEqual(taskFiltersPills);
        expect(trackingService.tasksFilterPillClicked).toHaveBeenCalledOnceWith({
          Asset: 'Mobile',
          filterPillType: 'Advances',
        });
      });
    });

    it('onFilterClick(): should call openFilters and trackingService.tasksFilterPillClicked', () => {
      spyOn(component, 'openFilters');
      component.onFilterClick('Expenses');
      expect(component.openFilters).toHaveBeenCalledOnceWith('Expenses');
      expect(trackingService.tasksFilterPillClicked).toHaveBeenCalledOnceWith({
        Asset: 'Mobile',
        filterPillType: 'Expenses',
      });
    });

    it('onFilterPillsClearAll(): should call applyFilters and update filterPills', () => {
      spyOn(component, 'applyFilters').and.callThrough();
      tasksService.generateFilterPills.and.returnValue(taskFiltersPills);

      component.onFilterPillsClearAll();
      expect(component.applyFilters).toHaveBeenCalledOnceWith(taskFiltersData2);
      expect(tasksService.generateFilterPills).toHaveBeenCalledOnceWith(taskFiltersData2);
      expect(component.filterPills).toEqual(taskFiltersPills);
      expect(trackingService.tasksFilterClearAllClicked).toHaveBeenCalledOnceWith({
        Asset: 'Mobile',
        appliedFilters: taskFiltersData2,
      });
    });

    describe('onTaskClicked(): ', () => {
      beforeEach(() => {
        spyOn(component, 'onExpensesToReportTaskClick');
        spyOn(component, 'onOpenDraftReportsTaskClick');
        spyOn(component, 'onSentBackReportTaskClick');
        spyOn(component, 'onReviewExpensesTaskClick');
        spyOn(component, 'onTeamReportsTaskClick');
        spyOn(component, 'onPotentialDuplicatesTaskClick');
        spyOn(component, 'onSentBackAdvanceTaskClick');
        spyOn(component, 'onMobileNumberVerificationTaskClick');
      });

      it('should call onExpensesToReportTaskClick if clicked on expensesAddToReport', () => {
        component.onTaskClicked(taskCtaData, dashboardTasksData[0]);
        expect(trackingService.tasksClicked).toHaveBeenCalledOnceWith({
          Asset: 'Mobile',
          header: dashboardTasksData[0].header,
        });
        expect(component.onExpensesToReportTaskClick).toHaveBeenCalledTimes(1);
        expect(component.onOpenDraftReportsTaskClick).not.toHaveBeenCalled();
        expect(component.onSentBackReportTaskClick).not.toHaveBeenCalled();
        expect(component.onReviewExpensesTaskClick).not.toHaveBeenCalled();
        expect(component.onTeamReportsTaskClick).not.toHaveBeenCalled();
        expect(component.onPotentialDuplicatesTaskClick).not.toHaveBeenCalled();
        expect(component.onSentBackAdvanceTaskClick).not.toHaveBeenCalled();
      });

      it('should call onOpenDraftReportsTaskClick if clicked on openDraftReports', () => {
        component.onTaskClicked(taskCtaData2, dashboardTasksData[0]);
        expect(trackingService.tasksClicked).toHaveBeenCalledOnceWith({
          Asset: 'Mobile',
          header: dashboardTasksData[0].header,
        });
        expect(component.onExpensesToReportTaskClick).not.toHaveBeenCalled();
        expect(component.onOpenDraftReportsTaskClick).toHaveBeenCalledOnceWith(taskCtaData2, dashboardTasksData[0]);
        expect(component.onSentBackReportTaskClick).not.toHaveBeenCalled();
        expect(component.onReviewExpensesTaskClick).not.toHaveBeenCalled();
        expect(component.onTeamReportsTaskClick).not.toHaveBeenCalled();
        expect(component.onPotentialDuplicatesTaskClick).not.toHaveBeenCalled();
        expect(component.onSentBackAdvanceTaskClick).not.toHaveBeenCalled();
      });

      it('should call onSentBackReportTaskClick if clicked on openSentBackReport', () => {
        component.onTaskClicked(taskCtaData3, dashboardTasksData[0]);
        expect(trackingService.tasksClicked).toHaveBeenCalledOnceWith({
          Asset: 'Mobile',
          header: dashboardTasksData[0].header,
        });
        expect(component.onExpensesToReportTaskClick).not.toHaveBeenCalled();
        expect(component.onOpenDraftReportsTaskClick).not.toHaveBeenCalled();
        expect(component.onSentBackReportTaskClick).toHaveBeenCalledOnceWith(taskCtaData3, dashboardTasksData[0]);
        expect(component.onReviewExpensesTaskClick).not.toHaveBeenCalled();
        expect(component.onTeamReportsTaskClick).not.toHaveBeenCalled();
        expect(component.onPotentialDuplicatesTaskClick).not.toHaveBeenCalled();
        expect(component.onSentBackAdvanceTaskClick).not.toHaveBeenCalled();
      });

      it('should call onReviewExpensesTaskClick if clicked on reviewExpenses', () => {
        component.onTaskClicked(taskCtaData4, dashboardTasksData[0]);
        expect(trackingService.tasksClicked).toHaveBeenCalledOnceWith({
          Asset: 'Mobile',
          header: dashboardTasksData[0].header,
        });
        expect(component.onExpensesToReportTaskClick).not.toHaveBeenCalled();
        expect(component.onOpenDraftReportsTaskClick).not.toHaveBeenCalled();
        expect(component.onSentBackReportTaskClick).not.toHaveBeenCalled();
        expect(component.onReviewExpensesTaskClick).toHaveBeenCalledTimes(1);
        expect(component.onTeamReportsTaskClick).not.toHaveBeenCalled();
        expect(component.onPotentialDuplicatesTaskClick).not.toHaveBeenCalled();
        expect(component.onSentBackAdvanceTaskClick).not.toHaveBeenCalled();
      });

      it('should call onTeamReportsTaskClick if clicked on openTeamReport', () => {
        component.onTaskClicked(taskCtaData5, dashboardTasksData[0]);
        expect(trackingService.tasksClicked).toHaveBeenCalledOnceWith({
          Asset: 'Mobile',
          header: dashboardTasksData[0].header,
        });
        expect(component.onExpensesToReportTaskClick).not.toHaveBeenCalled();
        expect(component.onOpenDraftReportsTaskClick).not.toHaveBeenCalled();
        expect(component.onSentBackReportTaskClick).not.toHaveBeenCalled();
        expect(component.onReviewExpensesTaskClick).not.toHaveBeenCalled();
        expect(component.onTeamReportsTaskClick).toHaveBeenCalledOnceWith(taskCtaData5, dashboardTasksData[0]);
        expect(component.onPotentialDuplicatesTaskClick).not.toHaveBeenCalled();
        expect(component.onSentBackAdvanceTaskClick).not.toHaveBeenCalled();
      });

      it('should call onPotentialDuplicatesTaskClick if clicked on openPotentialDuplicates', () => {
        component.onTaskClicked(taskCtaData6, dashboardTasksData[0]);
        expect(trackingService.tasksClicked).toHaveBeenCalledOnceWith({
          Asset: 'Mobile',
          header: dashboardTasksData[0].header,
        });
        expect(component.onExpensesToReportTaskClick).not.toHaveBeenCalled();
        expect(component.onOpenDraftReportsTaskClick).not.toHaveBeenCalled();
        expect(component.onSentBackReportTaskClick).not.toHaveBeenCalled();
        expect(component.onReviewExpensesTaskClick).not.toHaveBeenCalled();
        expect(component.onTeamReportsTaskClick).not.toHaveBeenCalled();
        expect(component.onPotentialDuplicatesTaskClick).toHaveBeenCalledTimes(1);
        expect(component.onSentBackAdvanceTaskClick).not.toHaveBeenCalled();
      });

      it('should call onSentBackAdvanceTaskClick if clicked on openSentBackAdvance', () => {
        component.onTaskClicked(taskCtaData7, dashboardTasksData[0]);
        expect(trackingService.tasksClicked).toHaveBeenCalledOnceWith({
          Asset: 'Mobile',
          header: dashboardTasksData[0].header,
        });
        expect(component.onExpensesToReportTaskClick).not.toHaveBeenCalled();
        expect(component.onOpenDraftReportsTaskClick).not.toHaveBeenCalled();
        expect(component.onSentBackReportTaskClick).not.toHaveBeenCalled();
        expect(component.onReviewExpensesTaskClick).not.toHaveBeenCalled();
        expect(component.onTeamReportsTaskClick).not.toHaveBeenCalled();
        expect(component.onPotentialDuplicatesTaskClick).not.toHaveBeenCalled();
        expect(component.onSentBackAdvanceTaskClick).toHaveBeenCalledOnceWith(taskCtaData7, dashboardTasksData[0]);
      });

      it('should call onMobileNumberVerificationTaskClick if clicked on mobileNumberVerification', () => {
        component.onTaskClicked(taskCtaData9, dashboardTasksData[0]);
        expect(trackingService.tasksClicked).toHaveBeenCalledOnceWith({
          Asset: 'Mobile',
          header: dashboardTasksData[0].header,
        });
        expect(component.onExpensesToReportTaskClick).not.toHaveBeenCalled();
        expect(component.onOpenDraftReportsTaskClick).not.toHaveBeenCalled();
        expect(component.onSentBackReportTaskClick).not.toHaveBeenCalled();
        expect(component.onReviewExpensesTaskClick).not.toHaveBeenCalled();
        expect(component.onTeamReportsTaskClick).not.toHaveBeenCalled();
        expect(component.onPotentialDuplicatesTaskClick).not.toHaveBeenCalled();
        expect(component.onSentBackAdvanceTaskClick).not.toHaveBeenCalled();
        expect(component.onMobileNumberVerificationTaskClick).toHaveBeenCalledOnceWith(taskCtaData9);
      });

      it('should only call trackingService.tasksClicked if none of them matches', () => {
        component.onTaskClicked(taskCtaData8, dashboardTasksData[0]);
        expect(trackingService.tasksClicked).toHaveBeenCalledOnceWith({
          Asset: 'Mobile',
          header: dashboardTasksData[0].header,
        });
        expect(component.onExpensesToReportTaskClick).not.toHaveBeenCalled();
        expect(component.onOpenDraftReportsTaskClick).not.toHaveBeenCalled();
        expect(component.onSentBackReportTaskClick).not.toHaveBeenCalled();
        expect(component.onReviewExpensesTaskClick).not.toHaveBeenCalled();
        expect(component.onTeamReportsTaskClick).not.toHaveBeenCalled();
        expect(component.onPotentialDuplicatesTaskClick).not.toHaveBeenCalled();
        expect(component.onSentBackAdvanceTaskClick).not.toHaveBeenCalled();
      });
    });
  });
}
