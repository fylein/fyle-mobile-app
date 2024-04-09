import { ComponentFixture, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';

import { TeamReportsPage } from './team-reports.page';
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
import { BehaviorSubject, of } from 'rxjs';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import {
  teamReportsFiltersData,
  teamReportsFiltersData2,
  teamReportsFiltersData3,
  teamReportsFiltersParams2,
  teamReportsFiltersParams3,
  teamReportsFiltersParams4,
  teamReportsFiltersParams5,
  teamReportsFiltersParams6,
  teamReportsFiltersParams7,
} from 'src/app/core/mock-data/team-reports-filters.data';
import { cloneDeep } from 'lodash';
import { TeamReportsFilters } from 'src/app/core/models/team-reports-filters.model';
import { selectedFilters4 } from 'src/app/core/mock-data/selected-filters.data';
import {
  tasksQueryParamsWithFiltersData2,
  tasksQueryParamsWithFiltersData3,
} from 'src/app/core/mock-data/get-tasks-query-params-with-filters.data';
import { creditTxnFilterPill } from 'src/app/core/mock-data/filter-pills.data';
import { teamReportsModalControllerParams } from 'src/app/core/mock-data/modal-controller.data';

export function TestCases4(getTestBed) {
  return describe('test cases set 3', () => {
    let component: TeamReportsPage;
    let fixture: ComponentFixture<TeamReportsPage>;
    let networkService: jasmine.SpyObj<NetworkService>;
    let loaderService: jasmine.SpyObj<LoaderService>;
    let reportService: jasmine.SpyObj<ReportService>;
    let modalController: jasmine.SpyObj<ModalController>;
    let dateService: jasmine.SpyObj<DateService>;
    let router: jasmine.SpyObj<Router>;
    let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
    let currencyService: jasmine.SpyObj<CurrencyService>;
    let popupService: jasmine.SpyObj<PopupService>;
    let trackingService: jasmine.SpyObj<TrackingService>;
    let apiV2Service: jasmine.SpyObj<ApiV2Service>;
    let tasksService: jasmine.SpyObj<TasksService>;
    let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
    let inputElement: HTMLInputElement;

    beforeEach(waitForAsync(() => {
      const TestBed = getTestBed();
      fixture = TestBed.createComponent(TeamReportsPage);
      component = fixture.componentInstance;
      networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
      loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
      reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
      modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
      dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
      router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
      popupService = TestBed.inject(PopupService) as jasmine.SpyObj<PopupService>;
      trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
      activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
      apiV2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
      tasksService = TestBed.inject(TasksService) as jasmine.SpyObj<TasksService>;
      orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    }));

    it('generateStateFilterPills(): should update filter pills', () => {
      component.simplifyReportsSettings$ = of({
        enabled: true,
      });
      const filterPill: FilterPill[] = [];
      component.generateStateFilterPills(filterPill, teamReportsFiltersParams3);
      expect(filterPill).toEqual([
        {
          label: 'State',
          type: 'state',
          value: 'draft, closed, cancelled',
        },
      ]);
    });

    describe('generateCustomDatePill(): ', () => {
      it('should update filter pills with start and end date if customDateStart and customDateEnd are defined', () => {
        const filterPill: FilterPill[] = [];
        component.generateCustomDatePill(teamReportsFiltersData3, filterPill);

        expect(filterPill).toEqual([
          {
            label: 'Submitted Date',
            type: 'date',
            value: '2023-01-1 to 2023-02-2',
          },
        ]);
      });

      it('should update filter pills with start date if customDateEnd is undefined', () => {
        const filterPill: FilterPill[] = [];
        const mockTeamReportsFiltersData3 = cloneDeep(teamReportsFiltersData3);
        mockTeamReportsFiltersData3.customDateEnd = undefined;
        component.generateCustomDatePill(mockTeamReportsFiltersData3, filterPill);

        expect(filterPill).toEqual([
          {
            label: 'Submitted Date',
            type: 'date',
            value: '>= 2023-01-1',
          },
        ]);
      });

      it('should update filter pills with end date if customDateStart is undefined', () => {
        const filterPill: FilterPill[] = [];
        const mockTeamReportsFiltersData3 = cloneDeep(teamReportsFiltersData3);
        mockTeamReportsFiltersData3.customDateStart = undefined;
        component.generateCustomDatePill(mockTeamReportsFiltersData3, filterPill);

        expect(filterPill).toEqual([
          {
            label: 'Submitted Date',
            type: 'date',
            value: '<= 2023-02-2',
          },
        ]);
      });

      it('should not update filter pills if customDateStart and customDateEnd are undefined', () => {
        const filterPill: FilterPill[] = [];
        component.generateCustomDatePill(teamReportsFiltersParams2, filterPill);

        expect(filterPill).toEqual([]);
      });
    });

    describe('generateDateFilterPills(): ', () => {
      it('should update filter pills value to this Week if dateFilter is thisWeek', () => {
        const mockTeamReportsFilters: Partial<TeamReportsFilters> = {
          date: 'thisWeek',
        };
        const filterPill: FilterPill[] = [];
        component.generateDateFilterPills(mockTeamReportsFilters, filterPill);
        expect(filterPill).toEqual([
          {
            label: 'Submitted Date',
            type: 'date',
            value: 'this Week',
          },
        ]);
      });

      it('should update filter pills value to this Month if dateFilter is thisMonth', () => {
        const mockTeamReportsFilters: Partial<TeamReportsFilters> = {
          date: 'thisMonth',
        };
        const filterPill: FilterPill[] = [];
        component.generateDateFilterPills(mockTeamReportsFilters, filterPill);
        expect(filterPill).toEqual([
          {
            label: 'Submitted Date',
            type: 'date',
            value: 'this Month',
          },
        ]);
      });

      it('should update filter pills value to All if dateFilter is all', () => {
        const mockTeamReportsFilters: Partial<TeamReportsFilters> = {
          date: 'all',
        };
        const filterPill: FilterPill[] = [];
        component.generateDateFilterPills(mockTeamReportsFilters, filterPill);
        expect(filterPill).toEqual([
          {
            label: 'Submitted Date',
            type: 'date',
            value: 'All',
          },
        ]);
      });

      it('should update filter pills value to Last Month if dateFilter is lastMonth', () => {
        const mockTeamReportsFilters: Partial<TeamReportsFilters> = {
          date: 'lastMonth',
        };
        const filterPill: FilterPill[] = [];
        component.generateDateFilterPills(mockTeamReportsFilters, filterPill);
        expect(filterPill).toEqual([
          {
            label: 'Submitted Date',
            type: 'date',
            value: 'Last Month',
          },
        ]);
      });

      it('should call generateCustomDatePill if dateFilter is custom', () => {
        spyOn(component, 'generateCustomDatePill').and.callThrough();
        const mockTeamReportsFilters: Partial<TeamReportsFilters> = {
          date: 'custom',
          customDateStart: new Date('2023-01-01'),
        };
        const filterPill: FilterPill[] = [];
        component.generateDateFilterPills(mockTeamReportsFilters, filterPill);
        expect(component.generateCustomDatePill).toHaveBeenCalledOnceWith(mockTeamReportsFilters, filterPill);
        expect(filterPill).toEqual([
          {
            label: 'Submitted Date',
            type: 'date',
            value: '>= 2023-01-1',
          },
        ]);
      });
    });

    describe('generateSortRptDatePills(): ', () => {
      it('should update filter pills value to old to new if sortParam is rp_submitted_at and direction is asc', () => {
        const filterPill: FilterPill[] = [];
        component.generateSortRptDatePills(teamReportsFiltersParams4, filterPill);
        expect(filterPill).toEqual([
          {
            label: 'Sort By',
            type: 'sort',
            value: 'Submitted date - old to new',
          },
        ]);
      });

      it('should update filter pills value to new to old if sortParam is rp_submitted_at and direction is desc', () => {
        const filterPill: FilterPill[] = [];
        const mockTeamReportsFiltersParams = cloneDeep(teamReportsFiltersParams4);
        mockTeamReportsFiltersParams.sortDir = 'desc';
        component.generateSortRptDatePills(mockTeamReportsFiltersParams, filterPill);
        expect(filterPill).toEqual([
          {
            label: 'Sort By',
            type: 'sort',
            value: 'Submitted date - new to old',
          },
        ]);
      });
    });

    describe('generateSortAmountPills(): ', () => {
      it('should update filter pills value to high to low if sortParam is rp_amount and direction is desc', () => {
        const filterPill: FilterPill[] = [];
        component.generateSortAmountPills(teamReportsFiltersParams5, filterPill);
        expect(filterPill).toEqual([
          {
            label: 'Sort By',
            type: 'sort',
            value: 'amount - high to low',
          },
        ]);
      });

      it('should update filter pills value to new to old if sortParam is rp_submitted_at and direction is asc', () => {
        const filterPill: FilterPill[] = [];
        const mockTeamReportsFiltersParams = cloneDeep(teamReportsFiltersParams5);
        mockTeamReportsFiltersParams.sortDir = 'asc';
        component.generateSortAmountPills(mockTeamReportsFiltersParams, filterPill);
        expect(filterPill).toEqual([
          {
            label: 'Sort By',
            type: 'sort',
            value: 'amount - low to high',
          },
        ]);
      });
    });

    describe('generateSortNamePills(): ', () => {
      it('should update filter pills value to a to z if sortParam is rp_purpose and direction is asc', () => {
        const filterPill: FilterPill[] = [];
        component.generateSortNamePills(teamReportsFiltersParams6, filterPill);
        expect(filterPill).toEqual([
          {
            label: 'Sort By',
            type: 'sort',
            value: 'Name - a to z',
          },
        ]);
      });

      it('should update filter pills value to z to a if sortParam is rp_purpose and direction is desc', () => {
        const filterPill: FilterPill[] = [];
        const mockTeamReportsFiltersParams = cloneDeep(teamReportsFiltersParams6);
        mockTeamReportsFiltersParams.sortDir = 'desc';
        component.generateSortNamePills(mockTeamReportsFiltersParams, filterPill);
        expect(filterPill).toEqual([
          {
            label: 'Sort By',
            type: 'sort',
            value: 'Name - z to a',
          },
        ]);
      });
    });

    it('generateSortFilterPills(): should call generateSortRptDatePills, generateSortAmountPills, generateSortNamePills and update filter pills based on sortParam and sortDir', () => {
      spyOn(component, 'generateSortRptDatePills').and.callThrough();
      spyOn(component, 'generateSortAmountPills').and.callThrough();
      spyOn(component, 'generateSortNamePills').and.callThrough();
      const filterPill: FilterPill[] = [];
      component.generateSortFilterPills(teamReportsFiltersParams5, filterPill);
      expect(component.generateSortRptDatePills).toHaveBeenCalledOnceWith(teamReportsFiltersParams5, filterPill);
      expect(component.generateSortAmountPills).toHaveBeenCalledOnceWith(teamReportsFiltersParams5, filterPill);
      expect(component.generateSortNamePills).toHaveBeenCalledOnceWith(teamReportsFiltersParams5, filterPill);
      expect(filterPill).toEqual([
        {
          label: 'Sort By',
          type: 'sort',
          value: 'amount - high to low',
        },
      ]);
    });

    describe('generateFilterPills(): ', () => {
      beforeEach(() => {
        component.simplifyReportsSettings$ = of({
          enabled: true,
        });
        spyOn(component, 'generateSortRptDatePills').and.callThrough();
        spyOn(component, 'generateSortAmountPills').and.callThrough();
        spyOn(component, 'generateSortNamePills').and.callThrough();
        spyOn(component, 'generateStateFilterPills').and.callThrough();
        spyOn(component, 'generateDateFilterPills').and.callThrough();
        spyOn(component, 'generateSortFilterPills').and.callThrough();
      });

      it('should call generateStateFilterPills if state is defined in filter and return the filter pill', () => {
        const filterPill = component.generateFilterPills(teamReportsFiltersParams3);
        expect(component.generateStateFilterPills).toHaveBeenCalledTimes(1);
        expect(component.generateDateFilterPills).not.toHaveBeenCalled();
        expect(component.generateSortFilterPills).not.toHaveBeenCalled();
        expect(filterPill).toEqual([
          {
            label: 'State',
            type: 'state',
            value: 'draft, closed, cancelled',
          },
        ]);
      });

      it('should call generateDateFilterPills if date is defined in filter and return the filter pill', () => {
        const filterPill = component.generateFilterPills(teamReportsFiltersParams7);
        expect(component.generateDateFilterPills).toHaveBeenCalledTimes(1);
        expect(component.generateStateFilterPills).not.toHaveBeenCalled();
        expect(component.generateSortFilterPills).not.toHaveBeenCalled();
        expect(filterPill).toEqual([
          {
            label: 'Submitted Date',
            type: 'date',
            value: 'this Week',
          },
        ]);
      });

      it('should call generateSortFilterPills if sortParam and sortDir are defined in filter and return the filter pill', () => {
        const filterPill = component.generateFilterPills(teamReportsFiltersParams5);
        expect(component.generateDateFilterPills).not.toHaveBeenCalled();
        expect(component.generateStateFilterPills).not.toHaveBeenCalled();
        expect(component.generateSortFilterPills).toHaveBeenCalledTimes(1);
        expect(filterPill).toEqual([
          {
            label: 'Sort By',
            type: 'sort',
            value: 'amount - high to low',
          },
        ]);
      });
    });

    describe('convertAmountSortToSelectedFilters(): ', () => {
      it('should update the generatedFilters passed as argument if sortParam is rp_amount and direction is desc', () => {
        const generatedFilters = [];
        component.convertAmountSortToSelectedFilters(teamReportsFiltersParams5, generatedFilters);
        expect(generatedFilters).toEqual([
          {
            name: 'Sort By',
            value: 'amountHighToLow',
          },
        ]);
      });

      it('should update the generatedFilters passed as argument if sortParam is rp_amount and direction is asc', () => {
        const generatedFilters = [];
        const mockTeamReportsFiltersParams = cloneDeep(teamReportsFiltersParams5);
        mockTeamReportsFiltersParams.sortDir = 'asc';
        component.convertAmountSortToSelectedFilters(mockTeamReportsFiltersParams, generatedFilters);
        expect(generatedFilters).toEqual([
          {
            name: 'Sort By',
            value: 'amountLowToHigh',
          },
        ]);
      });
    });

    it('should open a modal with filter options, set current page as 1 and call trackingService.TeamReportsFilterApplied', fakeAsync(() => {
      const filterPopoverSpy = jasmine.createSpyObj('filterPopover', ['present', 'onWillDismiss']);
      filterPopoverSpy.onWillDismiss.and.resolveTo({ data: selectedFilters4 });
      modalController.create.and.resolveTo(filterPopoverSpy);
      spyOn(component, 'convertFilters').and.returnValue(teamReportsFiltersData);
      spyOn(component, 'addNewFiltersToParams').and.returnValue(tasksQueryParamsWithFiltersData3);
      spyOn(component, 'generateFilterPills').and.returnValue(creditTxnFilterPill);
      component.filters = cloneDeep(teamReportsFiltersData2);
      spyOn(component, 'generateSelectedFilters').and.returnValue(selectedFilters4);
      component.loadData$ = cloneDeep(new BehaviorSubject(tasksQueryParamsWithFiltersData2));

      component.openFilters('State');
      tick(100);

      expect(modalController.create).toHaveBeenCalledOnceWith(teamReportsModalControllerParams);
      expect(component.generateSelectedFilters).toHaveBeenCalledOnceWith(teamReportsFiltersData2);
      expect(component.convertFilters).toHaveBeenCalledOnceWith(selectedFilters4);
      expect(component.filters).toEqual(teamReportsFiltersData);
      expect(component.currentPageNumber).toBe(1);
      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
      component.loadData$.subscribe((data) => {
        expect(data).toEqual(tasksQueryParamsWithFiltersData3);
      });
      expect(component.generateFilterPills).toHaveBeenCalledOnceWith(teamReportsFiltersData);
      expect(component.filterPills).toEqual(creditTxnFilterPill);
      expect(trackingService.TeamReportsFilterApplied).toHaveBeenCalledOnceWith({
        ...teamReportsFiltersData,
      });
    }));
  });
}
