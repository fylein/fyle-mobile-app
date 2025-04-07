import { ComponentFixture, discardPeriodicTasks, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';

import { TeamReportsPage } from './team-reports.page';
import { NetworkService } from 'src/app/core/services/network.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { DateService } from 'src/app/core/services/date.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExtendQueryParamsService } from 'src/app/core/services/extend-query-params.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { HeaderState } from 'src/app/shared/components/fy-header/header-state.enum';
import { BehaviorSubject, of } from 'rxjs';
import { creditTxnFilterPill } from 'src/app/core/mock-data/filter-pills.data';
import { getElementRef } from 'src/app/core/dom-helpers';
import { cloneDeep } from 'lodash';
import { orgSettingsParamsWithSimplifiedReport } from 'src/app/core/mock-data/org-settings.data';
import {
  tasksQueryParamsWithFiltersData,
  tasksQueryParamsWithFiltersData2,
} from 'src/app/core/mock-data/get-tasks-query-params-with-filters.data';
import { getTeamReportsParams1, getTeamReportsParams2 } from 'src/app/core/mock-data/api-params.data';
import { GetTasksQueryParamsWithFilters } from 'src/app/core/models/get-tasks-query-params-with-filters.model';
import { expectedReportsSinglePage } from 'src/app/core/mock-data/platform-report.data';
import { ApproverReportsService } from 'src/app/core/services/platform/v1/approver/reports.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { LaunchDarklyService } from '../../core/services/launch-darkly.service';

export function TestCases1(getTestBed) {
  return describe('test cases set 1', () => {
    let component: TeamReportsPage;
    let fixture: ComponentFixture<TeamReportsPage>;
    let networkService: jasmine.SpyObj<NetworkService>;
    let loaderService: jasmine.SpyObj<LoaderService>;
    let modalController: jasmine.SpyObj<ModalController>;
    let dateService: jasmine.SpyObj<DateService>;
    let router: jasmine.SpyObj<Router>;
    let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
    let currencyService: jasmine.SpyObj<CurrencyService>;
    let popupService: jasmine.SpyObj<PopupService>;
    let trackingService: jasmine.SpyObj<TrackingService>;
    let extendQueryParamsService: jasmine.SpyObj<ExtendQueryParamsService>;
    let tasksService: jasmine.SpyObj<TasksService>;
    let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
    let approverReportsService: jasmine.SpyObj<ApproverReportsService>;
    let authService: jasmine.SpyObj<AuthService>;
    let inputElement: HTMLInputElement;
    let launchDarklyService: jasmine.SpyObj<LaunchDarklyService>;

    beforeEach(waitForAsync(() => {
      const TestBed = getTestBed();
      fixture = TestBed.createComponent(TeamReportsPage);
      component = fixture.componentInstance;
      networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
      loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
      modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
      dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
      router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
      popupService = TestBed.inject(PopupService) as jasmine.SpyObj<PopupService>;
      trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
      activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
      extendQueryParamsService = TestBed.inject(ExtendQueryParamsService) as jasmine.SpyObj<ExtendQueryParamsService>;
      tasksService = TestBed.inject(TasksService) as jasmine.SpyObj<TasksService>;
      orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
      approverReportsService = TestBed.inject(ApproverReportsService) as jasmine.SpyObj<ApproverReportsService>;
      authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;
      launchDarklyService.getVariation.and.returnValue(of(false));
      component.eou$ = of(apiEouRes);
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
        authService.getEou.and.resolveTo(apiEouRes);
        currencyService.getHomeCurrency.and.returnValue(of('USD'));
        component.simpleSearchInput = getElementRef(fixture, '.reports--simple-search-input');
        const paginatedPipeValue = { count: 2, offset: 0, data: expectedReportsSinglePage };
        approverReportsService.getReportsByParams.and.returnValue(of(paginatedPipeValue));
        approverReportsService.getReportsCount.and.returnValue(of(20));
        mockAddNewFiltersToParams = spyOn(component, 'addNewFiltersToParams');
        const mockTasksQuery = cloneDeep(tasksQueryParamsWithFiltersData);
        mockAddNewFiltersToParams.and.returnValue(mockTasksQuery);
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

      it('should set filters in queryParams if filters is not defined in activatedRoute.snapshot.queryParams', (done) => {
        activatedRoute.snapshot.queryParams = {};
        component.ionViewWillEnter();
        component.eou$.subscribe((eou) => {
          expect(activatedRoute.snapshot.queryParams.filters).toEqual(JSON.stringify({ state: ['APPROVER_PENDING'] }));
          done();
        });
      });

      it('should set homeCurrency$ by calling currencyService.getHomeCurrency', (done) => {
        component.ionViewWillEnter();
        component.eou$.subscribe((eou) => {
          expect(eou).toEqual(apiEouRes);
          expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
          component.homeCurrency$.subscribe((homeCurrency) => {
            expect(homeCurrency).toEqual('USD');
            done();
          });
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

      it('should call approverReporsService.getReportsByParams and update acc', fakeAsync(() => {
        mockAddNewFiltersToParams.and.returnValue(tasksQueryParamsWithFiltersData2);
        orgSettingsService.get.and.returnValue(of(orgSettingsParamsWithSimplifiedReport));
        launchDarklyService.getVariation.and.returnValue(of(false));
        component.eou$ = of(apiEouRes);
        extendQueryParamsService.extendQueryParamsForTextSearch.and.returnValue({
          state: 'in.(APPROVER_PENDING)',
          next_approver_user_ids: 'cs.[usvKA4X8Ugcr]',
        });
        component.ionViewWillEnter();
        tick();
        component.eou$.subscribe((eou) => {
          expect(eou).toEqual(apiEouRes);
          expect(approverReportsService.getReportsByParams).toHaveBeenCalledTimes(1);
          expect(approverReportsService.getReportsByParams).toHaveBeenCalledWith(getTeamReportsParams1);
          expect(approverReportsService.getReportsByParams).toHaveBeenCalledWith(getTeamReportsParams2);
          expect(component.isLoadingDataInInfiniteScroll).toBeFalse();
          expect(component.acc).toEqual(expectedReportsSinglePage);
          component.teamReports$.subscribe((teamReports) => {
            expect(teamReports).toEqual(expectedReportsSinglePage);
          });
        });
        tick(500);
      }));

      it('should set count$ and isInfiniteScrollRequired$ and navigate relative to activatedRoute', (done) => {
        mockAddNewFiltersToParams.and.returnValue({
          pageNumber: 1,
          searchString: '',
        });
        component.ionViewWillEnter();
        component.eou$.subscribe((eou) => {
          expect(eou).toEqual(apiEouRes);
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
          done();
        });
      });

      it('should update filters, filterPills and loadData$ as per queryParams.filters', fakeAsync((done) => {
        component.ionViewWillEnter();
        component.eou$.subscribe((eou) => {
          expect(eou).toEqual(apiEouRes);
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

          discardPeriodicTasks();
        });
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

      it('should increment the current page number on infinite scroll', fakeAsync(() => {
        const mockReInfiniteScrollEvent = {
          target: jasmine.createSpyObj('target', ['complete']),
        };
        component.loadData(mockReInfiniteScrollEvent);
        expect(component.currentPageNumber).toBe(3);
        component.loadData$.subscribe((data) => {
          expect(data).toEqual({
            ...tasksQueryParamsWithFiltersData,
            pageNumber: 3,
          });
        });
        tick(1000);
        expect(mockReInfiniteScrollEvent.target.complete).toHaveBeenCalledTimes(1);
      }));

      it('should increment the current page number if infinite scroll event is undefined', () => {
        const mockReInfiniteScrollEvent = undefined;
        component.loadData(mockReInfiniteScrollEvent);
        expect(component.currentPageNumber).toBe(3);
        component.loadData$.subscribe((data) => {
          expect(data).toEqual({
            ...tasksQueryParamsWithFiltersData,
            pageNumber: 3,
          });
        });
      });
    });

    describe('doRefresh(): ', () => {
      let mockData: Partial<GetTasksQueryParamsWithFilters>;
      beforeEach(() => {
        component.currentPageNumber = 2;
        mockData = cloneDeep(tasksQueryParamsWithFiltersData);
        mockData.pageNumber = 3;
        component.loadData$ = new BehaviorSubject(mockData);
      });

      it('should set currentPageNumber and loadData$.pageNumber to 1 on refresh', () => {
        const mockRefreshEvent = {
          target: jasmine.createSpyObj('target', ['complete']),
        };
        component.doRefresh(mockRefreshEvent);
        expect(component.currentPageNumber).toBe(1);
        component.loadData$.subscribe((data) => {
          expect(data).toEqual({
            ...mockData,
            pageNumber: 1,
          });
        });
        expect(mockRefreshEvent.target.complete).toHaveBeenCalledTimes(1);
      });

      it('should set currentPageNumber and loadData$.pageNumber to 1 if target is not defined', () => {
        const mockRefreshEvent = {
          target: undefined,
        };
        component.doRefresh(mockRefreshEvent);
        expect(component.currentPageNumber).toBe(1);
        component.loadData$.subscribe((data) => {
          expect(data).toEqual({
            ...mockData,
            pageNumber: 1,
          });
        });
      });

      it('should set currentPageNumber and loadData$.pageNumber to 1 if refresh event is not defined', () => {
        const mockRefreshEvent = undefined;
        component.doRefresh(mockRefreshEvent);
        expect(component.currentPageNumber).toBe(1);
        component.loadData$.subscribe((data) => {
          expect(data).toEqual({
            ...mockData,
            pageNumber: 1,
          });
        });
      });
    });
  });
}
