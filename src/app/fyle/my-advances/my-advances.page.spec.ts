import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
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
    let advanceRequestServiceSpy = jasmine.createSpyObj('AdvanceRequestService', [
      'getMyAdvanceRequestsCount',
      'getMyadvanceRequests',
      'destroyAdvanceRequestsCacheBuster',
    ]);
    let routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    let advanceServiceSpy = jasmine.createSpyObj('AdvanceService', [
      'getMyAdvancesCount',
      'getMyadvances',
      'destroyAdvancesCacheBuster',
    ]);
    let networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    let filtersHelperServiceSpy = jasmine.createSpyObj('FiltersHelperService', [
      'generateFilterPills',
      'openFilterModal',
    ]);
    let utilityServiceSpy = jasmine.createSpyObj('UtilityService', ['sortAllAdvances']);
    let trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['footerHomeTabClicked', 'tasksPageOpened']);
    let tasksServiceSpy = jasmine.createSpyObj('TasksService', ['getAdvancesTaskCount', 'getTotalTaskCount']);
    let expenseFieldsServiceSpy = jasmine.createSpyObj('ExpenseFieldsService', ['getAllEnabled']);
    let orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);

    TestBed.configureTestingModule({
      declarations: [MyAdvancesPage, TitleCasePipe],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AdvanceRequestService, useValue: advanceRequestServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {
                filter: 'all',
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
});
