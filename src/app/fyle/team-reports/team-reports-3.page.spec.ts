import { ComponentFixture, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
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
import { HeaderState } from 'src/app/shared/components/fy-header/header-state.enum';
import { getElementRef } from 'src/app/core/dom-helpers';
import { cloneDeep } from 'lodash';
import { BehaviorSubject, of } from 'rxjs';
import {
  teamReportsFiltersData,
  teamReportsFiltersData2,
  teamReportsFiltersData3,
  teamReportsFiltersData4,
  teamReportsFiltersParams,
  teamReportsFiltersParams2,
} from 'src/app/core/mock-data/team-reports-filters.data';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import {
  selectedFilters6,
  selectedFiltersParams,
  selectedFiltersParams2,
} from 'src/app/core/mock-data/selected-filters.data';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { TranslocoService } from '@jsverse/transloco';

export function TestCases3(getTestBed) {
  return describe('test cases set 3', () => {
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

    it('onSimpleSearchCancel(): should set the header state to base and call clearText with "onSimpleSearchCancel"', () => {
      spyOn(component, 'clearText');

      component.onSimpleSearchCancel();

      expect(component.headerState).toEqual(HeaderState.base);
      expect(component.clearText).toHaveBeenCalledWith('onSimpleSearchCancel');
    });

    it('onSearchBarFocus(): should set isSearchBarFocused to true', () => {
      component.simpleSearchInput = getElementRef(fixture, '.reports--simple-search-input');
      inputElement = component.simpleSearchInput.nativeElement;
      component.isSearchBarFocused = false;

      inputElement.dispatchEvent(new Event('focus'));

      expect(component.isSearchBarFocused).toBeTrue();
    });

    it('onFilterPillsClearAll(): should call clearFilters', () => {
      spyOn(component, 'clearFilters');

      component.onFilterPillsClearAll();

      expect(component.clearFilters).toHaveBeenCalledTimes(1);
    });

    describe('onFilterClick(): ', () => {
      beforeEach(() => {
        spyOn(component, 'openFilters');
      });

      it('should call openFilters with State if filterType is state', () => {
        component.onFilterClick('state');

        expect(component.openFilters).toHaveBeenCalledOnceWith('State');
      });

      it('should call openFilters with Date if filterType is date', () => {
        component.onFilterClick('date');

        expect(component.openFilters).toHaveBeenCalledOnceWith('Submitted date');
      });

      it('should call openFilters with Date if filterType is date', () => {
        component.onFilterClick('sort');

        expect(component.openFilters).toHaveBeenCalledOnceWith('Sort by');
      });
    });

    describe('onFilterClose', () => {
      beforeEach(() => {
        component.filters = cloneDeep(teamReportsFiltersData);
        component.currentPageNumber = 2;
        component.loadData$ = new BehaviorSubject({
          pageNumber: 1,
        });
        spyOn(component, 'addNewFiltersToParams').and.returnValue({
          pageNumber: 1,
          sortDir: 'desc',
        });
        spyOn(component, 'generateFilterPills').and.returnValue([{ label: 'Date', type: 'date', value: 'this Week' }]);
      });

      it('should remove sort filters and update data when filterType is "sort"', () => {
        component.onFilterClose('sort');

        expect(component.filters.sortDir).toBeUndefined();
        expect(component.filters.sortParam).toBeUndefined();
        expect(component.filters.date).toBeDefined();
        expect(component.currentPageNumber).toEqual(1);
        expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
        component.loadData$.subscribe((data) => {
          expect(data).toEqual({
            pageNumber: 1,
            sortDir: 'desc',
          });
        });
        expect(component.generateFilterPills).toHaveBeenCalledOnceWith({
          date: 'custom',
        });
        expect(component.filterPills).toEqual([{ label: 'Date', type: 'date', value: 'this Week' }]);
      });

      it('should remove other filters and update data when filterType is not "sort"', () => {
        component.onFilterClose('date');

        expect(component.filters.sortDir).toBeDefined();
        expect(component.filters.sortParam).toBeDefined();
        expect(component.filters.date).toBeUndefined();
        expect(component.currentPageNumber).toEqual(1);
        component.loadData$.subscribe((data) => {
          expect(data).toEqual({
            pageNumber: 1,
            sortDir: 'desc',
          });
        });
        expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
        expect(component.generateFilterPills).toHaveBeenCalledOnceWith({
          sortDir: 'desc',
          sortParam: 'created_at',
        });
        expect(component.filterPills).toEqual([{ label: 'Date', type: 'date', value: 'this Week' }]);
      });
    });

    it('searchClick(): should set headerState and call focus method on input', fakeAsync(() => {
      component.simpleSearchInput = getElementRef(fixture, '.reports--simple-search-input');
      inputElement = component.simpleSearchInput.nativeElement;
      const mockFocus = spyOn(inputElement, 'focus');

      component.searchClick();

      expect(component.headerState).toEqual(HeaderState.simpleSearch);
      tick(300);

      expect(mockFocus).toHaveBeenCalledTimes(1);
    }));

    describe('convertRptDtSortToSelectedFilters(): ', () => {
      it('should add "dateOldToNew" to generatedFilters when sortParam is submitted_at and sortDir is asc', () => {
        const filter = {
          sortParam: 'last_submitted_at',
          sortDir: 'asc',
        };
        const generatedFilters: SelectedFilters<string | string[]>[] = [];

        component.convertRptDtSortToSelectedFilters(filter, generatedFilters);

        expect(generatedFilters.length).toEqual(1);
        expect(generatedFilters[0].name).toEqual('Sort by');
        expect(generatedFilters[0].value).toEqual('dateOldToNew');
      });

      it('should add "dateNewToOld" to generatedFilters when sortParam is submitted_at and sortDir is desc', () => {
        const filter = {
          sortParam: 'last_submitted_at',
          sortDir: 'desc',
        };
        const generatedFilters: SelectedFilters<string | string[]>[] = [];

        component.convertRptDtSortToSelectedFilters(filter, generatedFilters);

        expect(generatedFilters.length).toEqual(1);
        expect(generatedFilters[0].name).toEqual('Sort by');
        expect(generatedFilters[0].value).toEqual('dateNewToOld');
      });

      it('should not modify generatedFilters when sortParam is other than submitted_at', () => {
        const filter = {
          sortParam: 'created_at',
          sortDir: 'asc',
        };
        const generatedFilters: SelectedFilters<string | string[]>[] = [
          {
            name: 'Sort by',
            value: 'dateOldToNew',
          },
        ];

        component.convertRptDtSortToSelectedFilters(filter, generatedFilters);

        expect(generatedFilters.length).toEqual(1);
        expect(generatedFilters[0].name).toEqual('Sort by');
        expect(generatedFilters[0].value).toEqual('dateOldToNew');
      });
    });

    it('addSortToGeneratedFilters(): should call convertRptDtSortToSelectedFilters, convertAmountSortToSelectedFilters, and convertNameSortToSelectedFilters', () => {
      const filter = {
        sortParam: 'last_submitted_at',
        sortDir: 'asc',
      };
      const generatedFilters: SelectedFilters<string | string[]>[] = [];

      spyOn(component, 'convertRptDtSortToSelectedFilters').and.callThrough();
      spyOn(component, 'convertAmountSortToSelectedFilters').and.callThrough();
      spyOn(component, 'convertNameSortToSelectedFilters').and.callThrough();

      component.addSortToGeneratedFilters(filter, generatedFilters);

      expect(component.convertRptDtSortToSelectedFilters).toHaveBeenCalledTimes(1);
      expect(component.convertAmountSortToSelectedFilters).toHaveBeenCalledTimes(1);
      expect(component.convertNameSortToSelectedFilters).toHaveBeenCalledTimes(1);
      expect(generatedFilters).toEqual([
        {
          name: 'Sort by',
          value: 'dateOldToNew',
        },
      ]);
    });

    it('generateSelectedFilters(): should return generated Filters based on the filters selected', () => {
      spyOn(component, 'addSortToGeneratedFilters');

      const generatedFilters = component.generateSelectedFilters(teamReportsFiltersData2);

      expect(component.addSortToGeneratedFilters).toHaveBeenCalledOnceWith(teamReportsFiltersData2, selectedFilters6);
      expect(generatedFilters).toEqual(selectedFilters6);
    });

    describe('convertNameSortToSelectedFilters(): ', () => {
      it('should push filter sort by with value equal to nameAToZ if sortParam is purpose and sort direction is asc', () => {
        const generatedFilters = [];
        component.convertNameSortToSelectedFilters(teamReportsFiltersParams, generatedFilters);
        expect(generatedFilters).toEqual([
          {
            name: 'Sort by',
            value: 'nameAToZ',
          },
        ]);
      });

      it('should push filter sort by with value equal to nameZToA if sortParam is purpose and sort direction is desc', () => {
        const generatedFilters = [];
        component.convertNameSortToSelectedFilters(teamReportsFiltersParams2, generatedFilters);
        expect(generatedFilters).toEqual([
          {
            name: 'Sort by',
            value: 'nameZToA',
          },
        ]);
      });
    });

    describe('convertSelectedSortFiltersToFilters(): ', () => {
      it('should set param as last_submitted_at and direction as desc if sortBy value is dateNewToOld', () => {
        const generatedFilters = {};
        component.convertSelectedSortFiltersToFilters(selectedFiltersParams, generatedFilters);
        expect(generatedFilters).toEqual({
          sortParam: 'last_submitted_at',
          sortDir: 'desc',
        });
      });

      it('should set param as submitted_at and direction as asc if sortBy value is dateOldToNew', () => {
        const generatedFilters = {};
        const mockSelectedFiltersParams = cloneDeep(selectedFiltersParams);
        mockSelectedFiltersParams.value = 'dateOldToNew';
        component.convertSelectedSortFiltersToFilters(mockSelectedFiltersParams, generatedFilters);
        expect(generatedFilters).toEqual({
          sortParam: 'last_submitted_at',
          sortDir: 'asc',
        });
      });

      it('should set param as amount and direction as desc if sortBy value is amountHighToLow', () => {
        const generatedFilters = {};
        const mockSelectedFiltersParams = cloneDeep(selectedFiltersParams);
        mockSelectedFiltersParams.value = 'amountHighToLow';
        component.convertSelectedSortFiltersToFilters(mockSelectedFiltersParams, generatedFilters);
        expect(generatedFilters).toEqual({
          sortParam: 'amount',
          sortDir: 'desc',
        });
      });

      it('should set param as amount and direction as asc if sortBy value is amountLowToHigh', () => {
        const generatedFilters = {};
        const mockSelectedFiltersParams = cloneDeep(selectedFiltersParams);
        mockSelectedFiltersParams.value = 'amountLowToHigh';
        component.convertSelectedSortFiltersToFilters(mockSelectedFiltersParams, generatedFilters);
        expect(generatedFilters).toEqual({
          sortParam: 'amount',
          sortDir: 'asc',
        });
      });

      it('should set param as purpose and direction as asc if sortBy value is nameAToZ', () => {
        const generatedFilters = {};
        const mockSelectedFiltersParams = cloneDeep(selectedFiltersParams);
        mockSelectedFiltersParams.value = 'nameAToZ';
        component.convertSelectedSortFiltersToFilters(mockSelectedFiltersParams, generatedFilters);
        expect(generatedFilters).toEqual({
          sortParam: 'purpose',
          sortDir: 'asc',
        });
      });

      it('should set param as purpose and direction as desc if sortBy value is nameZToA', () => {
        const generatedFilters = {};
        const mockSelectedFiltersParams = cloneDeep(selectedFiltersParams);
        mockSelectedFiltersParams.value = 'nameZToA';
        component.convertSelectedSortFiltersToFilters(mockSelectedFiltersParams, generatedFilters);
        expect(generatedFilters).toEqual({
          sortParam: 'purpose',
          sortDir: 'desc',
        });
      });
    });

    describe('convertFilters(): ', () => {
      beforeEach(() => {
        spyOn(component, 'convertSelectedSortFiltersToFilters');
      });

      it('should return selectedFilters from selected filters', () => {
        const generatedFilters = component.convertFilters(selectedFiltersParams2);
        expect(component.convertSelectedSortFiltersToFilters).toHaveBeenCalledOnceWith(
          undefined,
          teamReportsFiltersData3,
        );
        expect(generatedFilters).toEqual(teamReportsFiltersData3);
      });

      it('should return selectedFilters from selected filters and set customDateStart and customDateEnd to undefined if associatedData is undefined', () => {
        const mockSelectedFiltersParams = cloneDeep(selectedFiltersParams2);
        const submittedDateFilter = mockSelectedFiltersParams.find((filter) => filter.name === 'Submitted date');
        submittedDateFilter.associatedData = undefined;
        const generatedFilters = component.convertFilters(mockSelectedFiltersParams);

        expect(component.convertSelectedSortFiltersToFilters).toHaveBeenCalledOnceWith(
          undefined,
          teamReportsFiltersData4,
        );
        expect(generatedFilters).toEqual(teamReportsFiltersData4);
      });
    });
  });
}
