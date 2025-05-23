import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyAdvancesPage } from './my-advances.page';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { ActivatedRoute, Router, UrlSerializer } from '@angular/router';
import { AdvanceService } from 'src/app/core/services/advance.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { FiltersHelperService } from 'src/app/core/services/filters-helper.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { of } from 'rxjs';
import { transformedResponse2 } from 'src/app/core/mock-data/expense-field.data';
import { allFilterPills } from 'src/app/core/mock-data/filter-pills.data';
import {
  publicAdvanceRequestRes,
  publicAdvanceRequestRes2,
  publicAdvanceRequestRes3,
  publicAdvanceRequestRes4,
  publicAdvanceRequestRes5,
  publicAdvanceRequestRes6,
} from 'src/app/core/mock-data/extended-advance-request.data';
import {
  singleExtendedAdvancesData,
  singleExtendedAdvancesData2,
  singleExtendedAdvancesData3,
} from 'src/app/core/mock-data/extended-advance.data';
import { orgSettingsData } from 'src/app/core/test-data/accounts.service.spec.data';
import { AdvancesStates } from 'src/app/core/models/advances-states.model';
import {
  draftSentBackFiltersData,
  myAdvancesFiltersData,
  myAdvancesFiltersData2,
} from 'src/app/core/mock-data/my-advances-filters.data';
import { orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { SortingDirection } from 'src/app/core/models/sorting-direction.model';
import { SortingParam } from 'src/app/core/models/sorting-param.model';
import { cloneDeep } from 'lodash';
import { filterOptions } from 'src/app/core/mock-data/filter-options.data';

describe('MyAdvancesPage', () => {
  let component: MyAdvancesPage;
  let fixture: ComponentFixture<MyAdvancesPage>;
  let advanceRequestService: jasmine.SpyObj<AdvanceRequestService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let router: jasmine.SpyObj<Router>;
  let advanceService: jasmine.SpyObj<AdvanceService>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let filtersHelperService: jasmine.SpyObj<FiltersHelperService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let tasksService: jasmine.SpyObj<TasksService>;
  let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;

  beforeEach(waitForAsync(() => {
    const advanceRequestServiceSpy = jasmine.createSpyObj('AdvanceRequestService', [
      'getSpenderAdvanceRequestsCount',
      'getSpenderAdvanceRequests',
      'destroyAdvanceRequestsCacheBuster',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const advanceServiceSpy = jasmine.createSpyObj('AdvanceService', [
      'getMyAdvancesCount',
      'getSpenderAdvances',
      'destroyAdvancesCacheBuster',
    ]);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const filtersHelperServiceSpy = jasmine.createSpyObj('FiltersHelperService', [
      'generateFilterPills',
      'openFilterModal',
    ]);
    const utilityServiceSpy = jasmine.createSpyObj('UtilityService', ['sortAllAdvances']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['footerHomeTabClicked', 'tasksPageOpened']);
    const tasksServiceSpy = jasmine.createSpyObj('TasksService', ['getAdvancesTaskCount', 'getTotalTaskCount']);
    const expenseFieldsServiceSpy = jasmine.createSpyObj('ExpenseFieldsService', ['getAllEnabled']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);

    TestBed.configureTestingModule({
      declarations: [MyAdvancesPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AdvanceRequestService, useValue: advanceRequestServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {
                filters: JSON.stringify(myAdvancesFiltersData),
              },
              params: {
                navigateBack: true,
              },
            },
          },
        },
        { provide: Router, useValue: routerSpy },
        { provide: AdvanceService, useValue: advanceServiceSpy },
        { provide: NetworkService, useValue: networkServiceSpy },
        { provide: FiltersHelperService, useValue: filtersHelperServiceSpy },
        { provide: UtilityService, useValue: utilityServiceSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: ExpenseFieldsService, useValue: expenseFieldsServiceSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
        TitleCasePipe,
        UrlSerializer,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MyAdvancesPage);
    component = fixture.componentInstance;
    advanceRequestService = TestBed.inject(AdvanceRequestService) as jasmine.SpyObj<AdvanceRequestService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    advanceService = TestBed.inject(AdvanceService) as jasmine.SpyObj<AdvanceService>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    filtersHelperService = TestBed.inject(FiltersHelperService) as jasmine.SpyObj<FiltersHelperService>;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    tasksService = TestBed.inject(TasksService) as jasmine.SpyObj<TasksService>;
    expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ionViewWillLeave(): should set onPageExit to null', () => {
    spyOn(component.onPageExit, 'next');
    component.ionViewWillLeave();
    expect(component.onPageExit.next).toHaveBeenCalledOnceWith(null);
  });

  describe('redirectToDashboardPage():', () => {
    beforeEach(() => {
      component.isConnected$ = of(false);
    });

    it('should redirect to dashboard page if device is offline', () => {
      component.redirectToDashboardPage();
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard']);
    });

    it('should not redirect to dashboard page if device is online', () => {
      component.isConnected$ = of(true);
      component.redirectToDashboardPage();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  it('setupNetworkWatcher(): should setup a network watcher', (done) => {
    networkService.connectivityWatcher.and.returnValue(null);
    networkService.isOnline.and.returnValue(of(true));
    spyOn(component, 'redirectToDashboardPage');

    component.setupNetworkWatcher();

    expect(networkService.connectivityWatcher).toHaveBeenCalledOnceWith(new EventEmitter<boolean>());
    expect(networkService.isOnline).toHaveBeenCalledTimes(1);
    expect(component.redirectToDashboardPage).toHaveBeenCalledTimes(1);
    component.isConnected$.subscribe((res) => {
      expect(res).toBeTrue();
      done();
    });
  });

  describe('getAndUpdateProjectName():', () => {
    beforeEach(() => {
      expenseFieldsService.getAllEnabled.and.returnValue(of(transformedResponse2));
    });

    it('should set projectFieldName to the field name provided by expenseFieldsService.getAllEnabled', () => {
      component.getAndUpdateProjectName();
      expect(expenseFieldsService.getAllEnabled).toHaveBeenCalledTimes(1);
      expect(component.projectFieldName).toEqual('Purpose');
    });

    it('should set projectFieldName to undefined if expenseFieldsService.getAllEnabled returns an empty array', () => {
      expenseFieldsService.getAllEnabled.and.returnValue(of([]));
      component.getAndUpdateProjectName();
      expect(expenseFieldsService.getAllEnabled).toHaveBeenCalledTimes(1);
      expect(component.projectFieldName).toBeUndefined();
    });
  });

  describe('ionViewWillEnter():', () => {
    beforeEach(() => {
      spyOn(component, 'setupNetworkWatcher');
      spyOn(component, 'updateMyAdvanceRequests').and.returnValue(publicAdvanceRequestRes.data);
      spyOn(component, 'updateMyAdvances').and.returnValue(singleExtendedAdvancesData.data);
      spyOn(component, 'getAndUpdateProjectName');
      tasksService.getAdvancesTaskCount.and.returnValue(of(4));
      tasksService.getTotalTaskCount.and.returnValue(of(5));
      filtersHelperService.generateFilterPills.and.returnValue(allFilterPills);
      advanceRequestService.getSpenderAdvanceRequestsCount.and.returnValue(of(1));
      advanceRequestService.getSpenderAdvanceRequests.and.returnValue(of(publicAdvanceRequestRes));
      advanceService.getMyAdvancesCount.and.returnValue(of(1));
      advanceService.getSpenderAdvances.and.returnValue(of(singleExtendedAdvancesData));
      orgSettingsService.get.and.returnValue(of(orgSettingsData));
      utilityService.sortAllAdvances.and.returnValue([publicAdvanceRequestRes3, publicAdvanceRequestRes3]);
    });

    it('should call setupNetworkWatcher() once, set advancesTaskCount to 4, navigateBack to true and totalTaskCount to 5', () => {
      component.ionViewWillEnter();
      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
      expect(component.advancesTaskCount).toEqual(4);
      expect(component.navigateBack).toBeTrue();
      expect(component.totalTaskCount).toEqual(5);
    });

    it('should call filterParams$.next and set filterPills to allFilterPills', () => {
      spyOn(component.filterParams$, 'next');
      component.ionViewWillEnter();
      expect(component.filterParams$.next).toHaveBeenCalledOnceWith(myAdvancesFiltersData);
      expect(component.filterPills).toEqual(allFilterPills);
      expect(filtersHelperService.generateFilterPills).toHaveBeenCalledOnceWith(component.filterParams$.value);
    });

    it('should set myAdvancerequests$ to publicAdvanceRequestRes.data', () => {
      component.ionViewWillEnter();
      component.myAdvanceRequests$.subscribe((res) => {
        expect(advanceRequestService.getSpenderAdvanceRequestsCount).toHaveBeenCalledOnceWith({
          advance_id: 'eq.null',
        });
        expect(advanceRequestService.getSpenderAdvanceRequests).toHaveBeenCalledOnceWith({
          offset: 0,
          limit: 200,
          queryParams: {
            advance_id: 'eq.null',
            order: 'created_at.desc,id.desc',
          },
        });
        expect(res).toEqual(publicAdvanceRequestRes.data);
      });
    });

    it('should set myAdvancerequests$ to publicAdvanceRequestRes2.data in form of array in case if count is greater than 200', () => {
      advanceRequestService.getSpenderAdvanceRequests.and.returnValues(
        of(publicAdvanceRequestRes2),
        of(publicAdvanceRequestRes2)
      );
      advanceRequestService.getSpenderAdvanceRequestsCount.and.returnValue(of(201));
      component.ionViewWillEnter();
      component.myAdvanceRequests$.subscribe((res) => {
        expect(advanceRequestService.getSpenderAdvanceRequestsCount).toHaveBeenCalledOnceWith({
          advance_id: 'eq.null',
        });
        expect(advanceRequestService.getSpenderAdvanceRequests).toHaveBeenCalledTimes(2);
        expect(advanceRequestService.getSpenderAdvanceRequests).toHaveBeenCalledWith({
          offset: 0,
          limit: 200,
          queryParams: {
            advance_id: 'eq.null',
            order: 'created_at.desc,id.desc',
          },
        });
        expect(advanceRequestService.getSpenderAdvanceRequests).toHaveBeenCalledWith({
          offset: 200,
          limit: 200,
          queryParams: {
            advance_id: 'eq.null',
            order: 'created_at.desc,id.desc',
          },
        });
        expect(res).toEqual([...publicAdvanceRequestRes2.data, ...publicAdvanceRequestRes2.data]);
      });
    });

    it('should set myAdvances$ to singleExtendedAdvancesData.data', () => {
      component.ionViewWillEnter();
      component.myAdvances$.subscribe((res) => {
        expect(advanceService.getMyAdvancesCount).toHaveBeenCalledTimes(1);
        expect(advanceService.getSpenderAdvances).toHaveBeenCalledOnceWith({
          offset: 0,
          limit: 200,
          queryParams: {
            order: 'created_at.desc,id.desc',
          },
        });
        expect(res).toEqual(singleExtendedAdvancesData.data);
      });
    });

    it('should set myAdvances$ to allTeamAdvanceRequestsRes.data in form of array in case if count is greater than 10', () => {
      advanceService.getSpenderAdvances.and.returnValues(
        of(singleExtendedAdvancesData2),
        of(singleExtendedAdvancesData)
      );
      advanceService.getMyAdvancesCount.and.returnValue(of(201));
      component.ionViewWillEnter();
      component.myAdvances$.subscribe((res) => {
        expect(advanceService.getMyAdvancesCount).toHaveBeenCalledTimes(1);
        expect(advanceService.getSpenderAdvances).toHaveBeenCalledTimes(2);
        expect(advanceService.getSpenderAdvances).toHaveBeenCalledWith({
          offset: 0,
          limit: 200,
          queryParams: {
            order: 'created_at.desc,id.desc',
          },
        });
        expect(advanceService.getSpenderAdvances).toHaveBeenCalledWith({
          offset: 200,
          limit: 200,
          queryParams: {
            order: 'created_at.desc,id.desc',
          },
        });
        expect(res).toEqual([...singleExtendedAdvancesData2.data, ...singleExtendedAdvancesData.data]);
      });
    });

    it('should set advances$ equals to array containing draft and sent back advance requests', () => {
      activatedRoute.snapshot.queryParams.filters = JSON.stringify(myAdvancesFiltersData2);
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      component.ionViewWillEnter();
      component.advances$.subscribe((res) => {
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(component.updateMyAdvanceRequests).toHaveBeenCalledOnceWith(publicAdvanceRequestRes.data);
        expect(component.updateMyAdvances).toHaveBeenCalledOnceWith(singleExtendedAdvancesData.data);
        expect(utilityService.sortAllAdvances).toHaveBeenCalledOnceWith(
          SortingDirection.ascending,
          SortingParam.project,
          []
        );
        expect(res).toEqual([publicAdvanceRequestRes3, publicAdvanceRequestRes3]);
      });
    });

    it('should call updateMyAdvanceRequests and updateMyAdvances with empty array if advance_requests and advances are disabled in org settings', () => {
      activatedRoute.snapshot.queryParams.filters = JSON.stringify(myAdvancesFiltersData2);
      orgSettingsService.get.and.returnValue(
        of({ ...orgSettingsRes, advance_requests: { enabled: false }, advances: { enabled: false } })
      );
      component.ionViewWillEnter();
      component.advances$.subscribe((res) => {
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(component.updateMyAdvanceRequests).toHaveBeenCalledOnceWith([]);
        expect(component.updateMyAdvances).toHaveBeenCalledOnceWith([]);
        expect(utilityService.sortAllAdvances).toHaveBeenCalledOnceWith(
          SortingDirection.ascending,
          SortingParam.project,
          []
        );
        expect(res).toEqual([publicAdvanceRequestRes3, publicAdvanceRequestRes3]);
      });
    });

    it('should set newArr if request is DRAFT and the request is pulled back or sent back', () => {
      activatedRoute.snapshot.queryParams.filters = JSON.stringify(draftSentBackFiltersData);
      component.updateMyAdvanceRequests = jasmine
        .createSpy()
        .and.returnValue([publicAdvanceRequestRes4, publicAdvanceRequestRes6]);
      utilityService.sortAllAdvances.and.returnValue([publicAdvanceRequestRes4, publicAdvanceRequestRes6]);
      orgSettingsService.get.and.returnValue(
        of({ ...orgSettingsRes, advance_requests: { enabled: false }, advances: { enabled: false } })
      );
      component.ionViewWillEnter();
      component.advances$.subscribe((res) => {
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(component.updateMyAdvanceRequests).toHaveBeenCalledOnceWith([]);
        expect(component.updateMyAdvances).toHaveBeenCalledOnceWith([]);
        expect(utilityService.sortAllAdvances).toHaveBeenCalledWith(SortingDirection.ascending, SortingParam.project, [
          publicAdvanceRequestRes4,
        ]);
        expect(res).toEqual([publicAdvanceRequestRes4, publicAdvanceRequestRes6]);
      });
    });
  });

  it('updateMyAdvances(): should set type, amount, orig_amount, created_at, currency, orig_currency and purpose in my advances', () => {
    const mockMyAdvancesData = cloneDeep(singleExtendedAdvancesData.data);
    const expectedMyAdvance = component.updateMyAdvances(mockMyAdvancesData);
    expect(expectedMyAdvance).toEqual([singleExtendedAdvancesData3]);
  });

  it('updateMyAdvanceRequests(): should set type, amount, orig_amount, created_at, currency, orig_currency and purpose in my advances request', () => {
    const mockMyAdvanceRequestsData = cloneDeep(publicAdvanceRequestRes5.data);
    const expectedMyAdvanceRequest = component.updateMyAdvanceRequests(mockMyAdvanceRequestsData);
    expect(expectedMyAdvanceRequest).toEqual([publicAdvanceRequestRes3]);
  });

  describe('doRefresh():', () => {
    beforeEach(() => {
      advanceRequestService.destroyAdvanceRequestsCacheBuster.and.returnValue(of(null));
      advanceService.destroyAdvancesCacheBuster.and.returnValue(of(null));
    });

    it('should call destroyAdvanceRequestsCacheBuster and destroyAdvancesCacheBuster', () => {
      const mockEvent = { target: { complete: jasmine.createSpy('complete') } };
      component.doRefresh(mockEvent);
      expect(advanceRequestService.destroyAdvanceRequestsCacheBuster).toHaveBeenCalledTimes(1);
      expect(advanceService.destroyAdvancesCacheBuster).toHaveBeenCalledTimes(1);
      expect(mockEvent.target.complete).toHaveBeenCalledTimes(1);
    });

    it('should not call complete if event.target is undefined', () => {
      const mockEvent = { target: undefined };
      component.doRefresh(mockEvent);
      expect(advanceRequestService.destroyAdvanceRequestsCacheBuster).toHaveBeenCalledTimes(1);
      expect(advanceService.destroyAdvancesCacheBuster).toHaveBeenCalledTimes(1);
    });
  });

  describe('onAdvanceClick():', () => {
    it('should set id as adv_id and navigate to my_view_advance_request', () => {
      const mockAdvanceData = cloneDeep(singleExtendedAdvancesData3);
      mockAdvanceData.type = AdvancesStates.paid;
      component.onAdvanceClick({ advanceRequest: mockAdvanceData, internalState: { state: 'INQUIRY' } });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'my_view_advance_request',
        { id: 'advRhdN9D326Y' },
      ]);
    });

    it('should set id as areq_id if adv_id is null and navigate to my_view_advance_request', () => {
      const mockAdvanceData = cloneDeep(singleExtendedAdvancesData3);
      mockAdvanceData.type = AdvancesStates.paid;
      mockAdvanceData.adv_id = null;
      component.onAdvanceClick({ advanceRequest: mockAdvanceData, internalState: { state: 'INQUIRY' } });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'my_view_advance_request',
        { id: 'areqrttywiidF8' },
      ]);
    });

    it('should navigate to my_view_advance', () => {
      component.onAdvanceClick({ advanceRequest: singleExtendedAdvancesData3, internalState: { state: 'INQUIRY' } });
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_view_advance', { id: 'advRhdN9D326Y' }]);
    });

    it('should navigate to add_edit_advance_request if advance request is request type and it is in inquiry state', () => {
      const mockAdvanceData = cloneDeep(singleExtendedAdvancesData3);
      mockAdvanceData.type = 'request';
      component.onAdvanceClick({ advanceRequest: mockAdvanceData, internalState: { state: 'INQUIRY' } });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_advance_request',
        { id: 'advRhdN9D326Y' },
      ]);
    });
  });

  it('onHomeClicked(): should navigate to my_dashboard page and track event', () => {
    component.onHomeClicked();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard'], {
      queryParams: {
        state: 'home',
      },
    });
    expect(trackingService.footerHomeTabClicked).toHaveBeenCalledOnceWith({
      page: 'Advances',
    });
  });

  it('onTaskClicked(): should navigate to my_dashboard page with queryParams.state as tasks', () => {
    component.onTaskClicked();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard'], {
      queryParams: {
        state: 'tasks',
        tasksFilters: 'advances',
      },
    });
    expect(trackingService.tasksPageOpened).toHaveBeenCalledOnceWith({
      Asset: 'Mobile',
      from: 'My Advances',
    });
  });

  it('onCameraClicked(): should navigate to camera_overlay page', () => {
    component.onCameraClicked();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'camera_overlay', { navigate_back: true }]);
  });

  describe('onFilterClose():', () => {
    beforeEach(() => {
      filtersHelperService.generateFilterPills.and.returnValue(allFilterPills);
      spyOn(component.filterParams$, 'next');
    });

    it('should call filterParams$ with sortParam and sortDir equals to null if argument is sort', () => {
      component.onFilterClose('sort');
      expect(component.filterParams$.next).toHaveBeenCalledOnceWith({
        sortParam: null,
        sortDir: null,
      });
      expect(filtersHelperService.generateFilterPills).toHaveBeenCalledOnceWith(component.filterParams$.value);
      expect(component.filterPills).toEqual(allFilterPills);
    });

    it('should call filterParams$ with state equals to null if argument is state', () => {
      component.onFilterClose('state');
      expect(component.filterParams$.next).toHaveBeenCalledOnceWith({
        state: null,
      });
      expect(filtersHelperService.generateFilterPills).toHaveBeenCalledOnceWith(component.filterParams$.value);
      expect(component.filterPills).toEqual(allFilterPills);
    });
  });

  describe('onFilterClick():', () => {
    beforeEach(() => {
      spyOn(component, 'openFilters');
    });

    it('onFilterClick(): should call openFilters with State if argument is state', fakeAsync(() => {
      component.onFilterClick('state');
      tick(100);
      expect(component.openFilters).toHaveBeenCalledOnceWith('State');
    }));

    it('onFilterClick(): should call openFilters with Sort by if argument is sort', fakeAsync(() => {
      component.onFilterClick('sort');
      tick(100);
      expect(component.openFilters).toHaveBeenCalledOnceWith('Sort by');
    }));
  });

  it('onFilterPillsClearAll(): should set filterPills to allFilterPills and call filterParams$.next', () => {
    spyOn(component.filterParams$, 'next');
    filtersHelperService.generateFilterPills.and.returnValue(allFilterPills);
    component.onFilterPillsClearAll();
    expect(component.filterPills).toEqual(allFilterPills);
    expect(component.filterParams$.next).toHaveBeenCalledOnceWith(component.filterParams$.value);
  });

  it('openFilters(): should call filtersHelperService.openFilterModal with title and filterParams', fakeAsync(() => {
    spyOn(component.filterParams$, 'next');
    filtersHelperService.generateFilterPills.and.returnValue(allFilterPills);
    filtersHelperService.openFilterModal.and.resolveTo(myAdvancesFiltersData2);
    component.projectFieldName = 'project';
    component.openFilters('State');
    tick(100);

    expect(filtersHelperService.openFilterModal).toHaveBeenCalledOnceWith(
      component.filterParams$.value,
      filterOptions,
      'State'
    );
    expect(component.filterParams$.next).toHaveBeenCalledOnceWith(myAdvancesFiltersData2);
    expect(component.filterPills).toEqual(allFilterPills);
    expect(filtersHelperService.generateFilterPills).toHaveBeenCalledOnceWith(component.filterParams$.value, 'project');
  }));

  it('goToAddEditAdvanceRequest(): should navigate to add_edit_advance_request page', () => {
    component.goToAddEditAdvanceRequest();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'add_edit_advance_request']);
  });
});
