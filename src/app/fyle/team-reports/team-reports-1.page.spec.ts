import { ComponentFixture, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ModalController, RefresherCustomEvent } from '@ionic/angular';

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
import { HeaderState } from 'src/app/shared/components/fy-header/header-state.enum';
import { BehaviorSubject, of } from 'rxjs';
import { orgSettingsData } from 'src/app/core/test-data/accounts.service.spec.data';
import { apiExtendedReportRes } from 'src/app/core/mock-data/report.data';
import { creditTxnFilterPill } from 'src/app/core/mock-data/filter-pills.data';
import { getElementRef } from 'src/app/core/dom-helpers';
import { cloneDeep } from 'lodash';
import { orgSettingsParamsWithSimplifiedReport } from 'src/app/core/mock-data/org-settings.data';
import {
  tasksQueryParamsWithFiltersData,
  tasksQueryParamsWithFiltersData2,
} from 'src/app/core/mock-data/get-tasks-query-params-with-filters.data';
import { tasksQueryParamsParams } from 'src/app/core/mock-data/get-tasks-query-params.data';
import { getTeamReportsParams1, getTeamReportsParams2 } from 'src/app/core/mock-data/api-params.data';

export function TestCases1(getTestBed) {
  return describe('test cases set 1', () => {
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

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('HeaderState(): should return HeaderState', () => {
      expect(component.HeaderState).toEqual(HeaderState);
    });

    it('ngOnInit(): should call setupNetworkWatcher once', () => {
      spyOn(component, 'setupNetworkWatcher');
      fixture.detectChanges();
      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
    });

    it('ionViewWillLeave(): should update onPageExit to null', () => {
      component.ionViewWillLeave();
      component.onPageExit.subscribe((pageExit) => {
        expect(pageExit).toBeNull();
      });
    });

    describe('ionViewWillEnter(): ', () => {
      let mockAddNewFiltersToParams: jasmine.Spy;
      beforeEach(() => {
        tasksService.getTeamReportsTaskCount.and.returnValue(of(10));
        orgSettingsService.get.and.returnValue(of(orgSettingsParamsWithSimplifiedReport));
        currencyService.getHomeCurrency.and.returnValue(of('USD'));
        apiV2Service.extendQueryParamsForTextSearch.and.returnValue({
          rp_approval_state: 'in.(APPROVAL_PENDING)',
          rp_state: 'in.(APPROVER_PENDING)',
          sequential_approval_turn: 'in.(true)',
        });
        component.simpleSearchInput = getElementRef(fixture, '.reports--simple-search-input');
        const paginatedPipeValue = { count: 2, offset: 0, data: apiExtendedReportRes };
        reportService.getTeamReports.and.returnValue(of(paginatedPipeValue));
        reportService.getTeamReportsCount.and.returnValue(of(20));
        mockAddNewFiltersToParams = spyOn(component, 'addNewFiltersToParams');
        mockAddNewFiltersToParams.and.returnValue(tasksQueryParamsWithFiltersData);
        spyOn(component, 'generateFilterPills').and.returnValue(creditTxnFilterPill);
        spyOn(component, 'clearFilters');
      });

      it('should set navigateBack to true if navigate_back is defined in activatedRoute.snapshot.params', () => {
        component.navigateBack = false;
        component.ionViewWillEnter();
        expect(component.navigateBack).toBeTrue();
      });

      it('should set navigateBack to false if navigate_back is undefined in activatedRoute.snapshot.params', () => {
        component.navigateBack = true;
        activatedRoute.snapshot.params.navigate_back = undefined;
        component.ionViewWillEnter();
        expect(component.navigateBack).toBeFalse();
      });

      it('should set teamReportsTaskCount by calling tasksService.getTeamReportsTaskCount', () => {
        component.ionViewWillEnter();
        expect(tasksService.getTeamReportsTaskCount).toHaveBeenCalledTimes(1);
        expect(component.teamReportsTaskCount).toBe(10);
      });

      it('should set simplifyReportsSettings$.enabled from orgSettingsService', () => {
        component.ionViewWillEnter();
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        component.simplifyReportsSettings$.subscribe((simplifyReportsSettings) => {
          expect(simplifyReportsSettings).toEqual({
            enabled: true,
          });
        });
      });

      it('should set simplifyReportsSettings$.enabled to false if enabled is false in orgSettings.simplified_report_closure_settings', () => {
        const mockOrgSettings = cloneDeep(orgSettingsParamsWithSimplifiedReport);
        mockOrgSettings.simplified_report_closure_settings.enabled = false;
        orgSettingsService.get.and.returnValue(of(mockOrgSettings));
        component.ionViewWillEnter();
        component.simplifyReportsSettings$.subscribe((simplifyReportsSettings) => {
          expect(simplifyReportsSettings).toEqual({
            enabled: false,
          });
        });
      });

      it('should set simplifyReportsSettings$.enabled to undefined if enabled is undefined in orgSettings.simplified_report_closure_settings', () => {
        const mockOrgSettings = cloneDeep(orgSettingsParamsWithSimplifiedReport);
        mockOrgSettings.simplified_report_closure_settings = undefined;
        orgSettingsService.get.and.returnValue(of(mockOrgSettings));
        component.ionViewWillEnter();
        component.simplifyReportsSettings$.subscribe((simplifyReportsSettings) => {
          expect(simplifyReportsSettings).toEqual({
            enabled: undefined,
          });
        });
      });

      it('should set simplifyReportsSettings$.enabled to undefined if orgSettings is undefined', () => {
        const mockOrgSettings = undefined;
        orgSettingsService.get.and.returnValue(of(mockOrgSettings));
        component.ionViewWillEnter();
        component.simplifyReportsSettings$.subscribe((simplifyReportsSettings) => {
          expect(simplifyReportsSettings).toEqual({
            enabled: undefined,
          });
        });
      });

      it('should set filters in queryParams if filters is not defined in activatedRoute.snapshot.queryParams', () => {
        activatedRoute.snapshot.queryParams = {};
        component.ionViewWillEnter();
        expect(activatedRoute.snapshot.queryParams.filters).toEqual(JSON.stringify({ state: ['APPROVER_PENDING'] }));
      });

      it('should set homeCurrency$ by calling currencyService.getHomeCurrency', () => {
        component.ionViewWillEnter();
        expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
        component.homeCurrency$.subscribe((homeCurrency) => {
          expect(homeCurrency).toEqual('USD');
        });
      });

      it('should set searchString as per the input provided by user and update loadData$', fakeAsync(() => {
        inputElement = component.simpleSearchInput.nativeElement;
        component.ionViewWillEnter();
        inputElement.value = 'example';
        inputElement.dispatchEvent(new Event('keyup'));
        tick(1000);
        expect(component.currentPageNumber).toBe(1);
      }));

      it('should call apiV2Service.extendQueryParamsForTextSearch', () => {
        component.ionViewWillEnter();
        expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledTimes(4);
        expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(tasksQueryParamsParams, undefined);
        expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
          {
            rp_state: 'in.(APPROVER_PENDING)',
          },
          'example'
        );
      });

      it('should call reportService.getTeamReports and update acc', () => {
        apiV2Service.extendQueryParamsForTextSearch.and.returnValue({
          rp_state: 'in.(APPROVER_PENDING)',
        });
        mockAddNewFiltersToParams.and.returnValue(tasksQueryParamsWithFiltersData2);
        component.ionViewWillEnter();
        expect(reportService.getTeamReports).toHaveBeenCalledTimes(2);
        expect(reportService.getTeamReports).toHaveBeenCalledWith(getTeamReportsParams1);
        expect(reportService.getTeamReports).toHaveBeenCalledWith(getTeamReportsParams2);
        expect(component.isLoadingDataInInfiniteScroll).toBeFalse();
        expect(component.acc).toEqual(apiExtendedReportRes);
        component.teamReports$.subscribe((teamReports) => {
          expect(teamReports).toEqual(apiExtendedReportRes);
        });
      });

      it('should set count$ and isInfiniteScrollRequired$ and navigate relative to activatedRoute', () => {
        mockAddNewFiltersToParams.and.returnValue({
          pageNumber: 1,
          searchString: '',
        });
        component.ionViewWillEnter();
        component.count$.subscribe((count) => {
          expect(count).toBe(20);
        });
        component.isInfiniteScrollRequired$.subscribe((isInfiniteScrollRequired) => {
          expect(isInfiniteScrollRequired).toBeTrue();
        });
        expect(router.navigate).toHaveBeenCalledTimes(2);
        expect(router.navigate).toHaveBeenCalledWith([], {
          relativeTo: activatedRoute,
          queryParams: { filters: JSON.stringify(component.filters) },
          replaceUrl: true,
        });
      });

      it('should update filters, filterPills and loadData$ as per queryParams.filters', fakeAsync(() => {
        component.ionViewWillEnter();
        expect(component.isLoading).toBeTrue();
        expect(component.filters).toEqual({
          state: ['APPROVER_PENDING'],
        });
        expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
        component.loadData$.subscribe((loadData) => {
          expect(loadData).toEqual(tasksQueryParamsWithFiltersData);
        });
        expect(component.generateFilterPills).toHaveBeenCalledOnceWith({
          state: ['APPROVER_PENDING'],
        });
        expect(component.filterPills).toEqual(creditTxnFilterPill);
        tick(500);
        expect(component.isLoading).toBeFalse();
      }));
    });

    describe('setupNetworkWatcher(): ', () => {
      it('should navigate user to my_dashboard if user is offline', () => {
        networkService.isOnline.and.returnValue(of(false));

        component.setupNetworkWatcher();
        expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(1);
        expect(networkService.isOnline).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard']);
        component.isConnected$.subscribe((online) => {
          expect(online).toBeFalse();
        });
      });

      it('should set isConnected to true if user is online', () => {
        networkService.isOnline.and.returnValue(of(true));

        component.setupNetworkWatcher();
        expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(1);
        expect(networkService.isOnline).toHaveBeenCalledTimes(1);
        expect(router.navigate).not.toHaveBeenCalled();
        component.isConnected$.subscribe((online) => {
          expect(online).toBeTrue();
        });
      });
    });

    describe('loadData(): ', () => {
      beforeEach(() => {
        component.currentPageNumber = 2;
        component.loadData$ = new BehaviorSubject(cloneDeep(tasksQueryParamsWithFiltersData));
      });

      it('should increment the current page number on ionRefresher event', fakeAsync(() => {
        const mockRefreshEvent = {
          target: {
            complete: jasmine.createSpy('complete'),
          },
        };
        component.loadData(mockRefreshEvent);
        expect(component.currentPageNumber).toBe(3);
        component.loadData$.subscribe((data) => {
          expect(data).toEqual({
            ...tasksQueryParamsWithFiltersData,
            pageNumber: 3,
          });
        });
        tick(1000);
        expect(mockRefreshEvent.target.complete).toHaveBeenCalledTimes(1);
      }));

      it('should increment the current page number if ionRefresher event is undefined', () => {
        const mockRefreshEvent = undefined;
        component.loadData(mockRefreshEvent);
        expect(component.currentPageNumber).toBe(3);
        component.loadData$.subscribe((data) => {
          expect(data).toEqual({
            ...tasksQueryParamsWithFiltersData,
            pageNumber: 3,
          });
        });
      });
    });
  });
}
