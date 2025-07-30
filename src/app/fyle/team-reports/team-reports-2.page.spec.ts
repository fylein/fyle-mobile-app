import { ComponentFixture, waitForAsync } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';

import { TeamReportsPage } from './team-reports.page';
import { NetworkService } from 'src/app/core/services/network.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { DateService } from 'src/app/core/services/date.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { BehaviorSubject, of } from 'rxjs';
import { getElementRef } from 'src/app/core/dom-helpers';
import { cloneDeep } from 'lodash';
import {
  tasksQueryParamsWithFiltersData,
  tasksQueryParamsWithFiltersData3,
} from 'src/app/core/mock-data/get-tasks-query-params-with-filters.data';
import {
  teamReportsQueryParams,
  teamReportsQueryParams2,
  teamReportsQueryParams3,
} from 'src/app/core/mock-data/get-tasks-query-params.data';
import { GetTasksQueryParams } from 'src/app/core/models/get-tasks.query-params.model';
import dayjs from 'dayjs';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { expectedReportsSinglePage } from 'src/app/core/mock-data/platform-report.data';
import { TranslocoService } from '@jsverse/transloco';

export function TestCases2(getTestBed) {
  return describe('test cases set 2', () => {
    let component: TeamReportsPage;
    let fixture: ComponentFixture<TeamReportsPage>;
    let networkService: jasmine.SpyObj<NetworkService>;
    let loaderService: jasmine.SpyObj<LoaderService>;
    let modalController: jasmine.SpyObj<ModalController>;
    let dateService: jasmine.SpyObj<DateService>;
    let router: jasmine.SpyObj<Router>;
    let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
    let currencyService: jasmine.SpyObj<CurrencyService>;
    let trackingService: jasmine.SpyObj<TrackingService>;
    let tasksService: jasmine.SpyObj<TasksService>;
    let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
    let inputElement: HTMLInputElement;
    let translocoService: jasmine.SpyObj<TranslocoService>;

    beforeEach(waitForAsync(() => {
      const TestBed = getTestBed();

      // Create a spy for TranslocoService
      const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

      // Mock the translate method
      translocoServiceSpy.translate.and.callFake((key: any, params?: any) => {
        const translations: { [key: string]: string } = {
          'pipes.reportState.draft': 'draft',
          'pipes.reportState.submitted': 'submitted',
          'pipes.reportState.reported': 'reported',
          'pipes.reportState.sentBack': 'sent_back',
          'pipes.reportState.autoFlagged': 'auto_flagged',
          'pipes.reportState.rejected': 'rejected',
          'pipes.reportState.approved': 'approved',
          'pipes.reportState.paymentPending': 'payment_pending',
          'pipes.reportState.processing': 'processing',
          'pipes.reportState.closed': 'closed',
          'pipes.reportState.cancelled': 'cancelled',
          'pipes.reportState.disabled': 'disabled',
        };
        return translations[key] || key;
      });

      // Add Transloco configuration to the test module
      TestBed.configureTestingModule({
        providers: [{ provide: TranslocoService, useValue: translocoServiceSpy }],
      });

      fixture = TestBed.createComponent(TeamReportsPage);
      component = fixture.componentInstance;
      networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
      loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
      modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
      dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
      router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
      trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
      activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
      tasksService = TestBed.inject(TasksService) as jasmine.SpyObj<TasksService>;
      orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
      component.eou$ = of(apiEouRes);
      translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    }));

    describe('generateCustomDateParams(): ', () => {
      beforeEach(() => {
        component.filters = {
          date: 'custom',
        };
      });

      it('should not alter queryParams if customDateStart and customDateEnd are not defined in filters', () => {
        const queryParams: Partial<GetTasksQueryParams> = {};

        component.generateCustomDateParams(queryParams);
        expect(queryParams).toEqual({});
      });

      it('should not update queryParams if customDateStart and customDateEnd are defined in filters', () => {
        component.filters = {
          date: 'custom',
          customDateStart: new Date('2023-01-01'),
          customDateEnd: new Date('2023-01-04'),
        };
        const queryParams: Partial<GetTasksQueryParams> = {};

        component.generateCustomDateParams(queryParams);
        expect(queryParams).toEqual(teamReportsQueryParams);
      });

      it('should not update queryParams if only customDateStart is defined in filters', () => {
        component.filters = {
          date: 'custom',
          customDateStart: new Date('2023-01-01'),
        };
        const queryParams: Partial<GetTasksQueryParams> = {};

        component.generateCustomDateParams(queryParams);
        expect(queryParams).toEqual(teamReportsQueryParams2);
      });

      it('should not update queryParams if only customDateEnd is defined in filters', () => {
        component.filters = {
          date: 'custom',
          customDateEnd: new Date('2023-01-04'),
        };
        const queryParams: Partial<GetTasksQueryParams> = {};

        component.generateCustomDateParams(queryParams);
        expect(queryParams).toEqual(teamReportsQueryParams3);
      });
    });

    describe('generateDateParams(): ', () => {
      beforeEach(() => {
        component.filters = {
          date: 'thisMonth',
          customDateStart: new Date('2023-01-01'),
          customDateEnd: new Date('2023-01-04'),
        };
        spyOn(component, 'generateCustomDateParams');
      });

      it('should update queryParams if filters date is thisMonth', () => {
        dateService.getThisMonthRange.and.returnValue({
          from: new Date('2023-01-01'),
          to: new Date('2023-01-04'),
        });
        const queryParams: Partial<GetTasksQueryParams> = {};
        component.generateDateParams(queryParams);
        expect(dateService.getThisMonthRange).toHaveBeenCalledTimes(1);
        expect(queryParams).toEqual(teamReportsQueryParams);
        expect(component.generateCustomDateParams).toHaveBeenCalledOnceWith(teamReportsQueryParams);
      });

      it('should update queryParams if filters date is thisWeek', () => {
        component.filters.date = 'thisWeek';
        dateService.getThisWeekRange.and.returnValue({
          from: dayjs(new Date('2023-01-01')),
          to: dayjs(new Date('2023-01-04')),
        });
        const queryParams: Partial<GetTasksQueryParams> = {};
        component.generateDateParams(queryParams);
        expect(dateService.getThisWeekRange).toHaveBeenCalledTimes(1);
        expect(queryParams).toEqual(teamReportsQueryParams);
        expect(component.generateCustomDateParams).toHaveBeenCalledOnceWith(teamReportsQueryParams);
      });

      it('should update queryParams if filters date is lastMonth', () => {
        component.filters.date = 'lastMonth';
        dateService.getLastMonthRange.and.returnValue({
          from: new Date('2023-01-01'),
          to: new Date('2023-01-04'),
        });
        const queryParams: Partial<GetTasksQueryParams> = {};
        component.generateDateParams(queryParams);
        expect(dateService.getLastMonthRange).toHaveBeenCalledTimes(1);
        expect(queryParams).toEqual(teamReportsQueryParams);
        expect(component.generateCustomDateParams).toHaveBeenCalledOnceWith(teamReportsQueryParams);
      });
    });

    describe('generateStateFilters(): ', () => {
      beforeEach(() => {
        component.filters = {
          state: ['APPROVER_PENDING', 'APPROVER_INQUIRY'],
        };
      });

      it('should update queryParams.or if filter state is defined and consist of APPROVER_PENDING and APPROVER_INQUIRY', () => {
        const queryParams: Partial<GetTasksQueryParams> = {};
        component.generateStateFilters(queryParams, apiEouRes);
        expect(queryParams).toEqual({
          state: 'in.(APPROVER_PENDING,APPROVER_INQUIRY)',
        });
      });

      it('should update queryParams.or and queryParams.sequential_approval_turn if filter state consist only of APPROVER_PENDING', () => {
        component.filters.state = ['APPROVER_PENDING'];
        const queryParams: Partial<GetTasksQueryParams> = {};
        component.generateStateFilters(queryParams, apiEouRes);
        expect(queryParams).toEqual({
          state: 'in.(APPROVER_PENDING)',
          next_approver_user_ids: 'cs.[usvKA4X8Ugcr]',
        });
      });

      it('should update queryParams.or if filter state consist of APPROVED and PAID', () => {
        component.filters.state = ['APPROVED', 'PAID'];
        const queryParams: Partial<GetTasksQueryParams> = {};
        component.generateStateFilters(queryParams, apiEouRes);
        expect(queryParams).toEqual({
          state: 'in.(APPROVED,PAID)',
        });
      });
    });

    describe('setSortParams(): ', () => {
      beforeEach(() => {
        component.filters = {
          sortParam: 'rp_amount',
          sortDir: 'desc',
        };
      });

      it('should set currentParams sortParam and sortDir equal to filter.sortParam and filter.sortDir if filter.sortParam and filter.sortDir are defined', () => {
        const mockQueryParams = cloneDeep(tasksQueryParamsWithFiltersData);
        component.setSortParams(mockQueryParams);

        expect(mockQueryParams).toEqual({
          ...mockQueryParams,
          sortParam: 'rp_amount',
          sortDir: 'desc',
        });
      });

      it('should set currentParams sortParam and sortDir equal to last_submitted_at and desc if filter.sortParam and filter.sortDir are not defined', () => {
        component.filters = {};
        const mockQueryParams = cloneDeep(tasksQueryParamsWithFiltersData);
        component.setSortParams(mockQueryParams);

        expect(mockQueryParams).toEqual({
          ...mockQueryParams,
          sortParam: 'last_submitted_at',
          sortDir: 'desc',
        });
      });
    });

    it('addNewFiltersToParams(): should update currentParams with new filters and return the updated currentParams', () => {
      const mockTaskQueryParamsData = cloneDeep(tasksQueryParamsWithFiltersData);
      component.loadData$ = new BehaviorSubject(mockTaskQueryParamsData);
      component.filters = {
        date: 'thisMonth',
        state: 'in.(APPROVER_INQUIRY)',
      };

      dateService.getThisMonthRange.and.returnValue({
        from: new Date('2023-01-01'),
        to: new Date('2023-01-04'),
      });
      spyOn(component, 'generateDateParams').and.callThrough();
      spyOn(component, 'generateStateFilters').and.callThrough();
      spyOn(component, 'setSortParams').and.callThrough();

      const result = component.addNewFiltersToParams(apiEouRes);

      expect(component.generateDateParams).toHaveBeenCalledTimes(1);
      expect(component.generateStateFilters).toHaveBeenCalledTimes(1);
      expect(component.setSortParams).toHaveBeenCalledOnceWith(mockTaskQueryParamsData);
      expect(result).toEqual(tasksQueryParamsWithFiltersData3);
    });

    it('clearFilters(): should remove all the filters and set current page number to 1', () => {
      component.loadData$ = new BehaviorSubject({
        pageNumber: 1,
      });
      spyOn(component, 'generateFilterPills').and.returnValue([]);
      spyOn(component, 'addNewFiltersToParams').and.returnValue({ sortDir: 'desc', sortParam: 'approvalDate' });

      component.clearFilters();
      expect(component.filters).toEqual({});
      expect(component.currentPageNumber).toBe(1);
      component.loadData$.subscribe((data) => {
        expect(data).toEqual({ sortDir: 'desc', sortParam: 'approvalDate' });
      });
      expect(component.filterPills).toEqual([]);
    });

    it('onReportClick(): should navigate to the view report page', () => {
      const report = expectedReportsSinglePage[0];

      component.onReportClick(report);

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'view_team_report',
        { id: report.id, navigate_back: true },
      ]);
    });

    it('onHomeClicked(): should navigate to home dashboard and track event', () => {
      component.onHomeClicked();

      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard'], {
        queryParams: { state: 'home' },
      });
      expect(trackingService.footerHomeTabClicked).toHaveBeenCalledOnceWith({ page: 'Team Reports' });
    });

    it('onTaskClicked(): should navigate to home dashboard and track event', () => {
      component.onTaskClicked();

      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard'], {
        queryParams: { state: 'tasks', tasksFilters: 'team_reports' },
      });
    });

    it('onCameraClicked(): should navigate to camera overlay', () => {
      component.onCameraClicked();

      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'camera_overlay', { navigate_back: true }]);
    });

    describe('clearText(): ', () => {
      it('should clear the search text, input value, dispatch keyup event, and update search bar focus', () => {
        component.simpleSearchInput = getElementRef(fixture, '.reports--simple-search-input');
        inputElement = component.simpleSearchInput.nativeElement;
        const dispatchEventSpy = spyOn(inputElement, 'dispatchEvent');
        component.simpleSearchText = 'some text';
        inputElement.value = 'some text';
        component.isSearchBarFocused = true;

        component.clearText('');

        expect(component.simpleSearchText).toEqual('');
        expect(inputElement.value).toEqual('');
        expect(dispatchEventSpy).toHaveBeenCalledOnceWith(new Event('keyup'));
        expect(component.isSearchBarFocused).toBeTrue();
      });

      it('should clear the search text, input value, dispatch keyup event, and toggle search bar focus when called from onSimpleSearchCancel', () => {
        component.simpleSearchInput = getElementRef(fixture, '.reports--simple-search-input');
        inputElement = component.simpleSearchInput.nativeElement;
        const dispatchEventSpy = spyOn(inputElement, 'dispatchEvent');
        component.simpleSearchText = 'some text';
        inputElement.value = 'some text';
        component.isSearchBarFocused = true;

        component.clearText('onSimpleSearchCancel');

        expect(component.simpleSearchText).toEqual('');
        expect(inputElement.value).toEqual('');
        expect(dispatchEventSpy).toHaveBeenCalledOnceWith(new Event('keyup'));
        expect(component.isSearchBarFocused).toBeFalse();
      });
    });
  });
}
