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
  });
}
