import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ActionSheetController, IonicModule, NavController, Platform } from '@ionic/angular';

import { DashboardPage } from './dashboard.page';
import { NetworkService } from 'src/app/core/services/network.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BackButtonService } from 'src/app/core/services/back-button.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { SmartlookService } from 'src/app/core/services/smartlook.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { FooterState } from 'src/app/shared/components/footer/footer-state';
import { Subject, Subscription, of } from 'rxjs';
import { orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { cloneDeep } from 'lodash';
import { expectedActionSheetButtonRes } from 'src/app/core/mock-data/action-sheet-options.data';
import { creditTxnFilterPill } from 'src/app/core/mock-data/filter-pills.data';
import { allowedExpenseTypes } from 'src/app/core/mock-data/allowed-expense-types.data';
import { mileagePerDiemPlatformCategoryData } from 'src/app/core/mock-data/org-category.data';
import { CategoriesService } from 'src/app/core/services/categories.service';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let router: jasmine.SpyObj<Router>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let actionSheetController: jasmine.SpyObj<ActionSheetController>;
  let tasksService: jasmine.SpyObj<TasksService>;
  let smartlookService: jasmine.SpyObj<SmartlookService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let categoriesService: jasmine.SpyObj<CategoriesService>;
  let backButtonService: jasmine.SpyObj<BackButtonService>;
  let platform: Platform;
  let navController: jasmine.SpyObj<NavController>;

  beforeEach(waitForAsync(() => {
    let networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    let currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    let routerSpy = jasmine.createSpyObj('Router', ['navigate', 'url']);
    let trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'tasksPageOpened',
      'footerHomeTabClicked',
      'dashboardActionSheetButtonClicked',
      'dashboardActionSheetOpened',
    ]);
    let actionSheetControllerSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    let tasksServiceSpy = jasmine.createSpyObj('TasksService', ['getTotalTaskCount']);
    let smartlookServiceSpy = jasmine.createSpyObj('SmartlookService', ['init']);
    let orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    let orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get']);
    const categoriesServiceSpy = jasmine.createSpyObj('CategoriesService', ['getMileageOrPerDiemCategories']);
    let backButtonServiceSpy = jasmine.createSpyObj('BackButtonService', ['showAppCloseAlert']);
    let navControllerSpy = jasmine.createSpyObj('NavController', ['back']);

    TestBed.configureTestingModule({
      declarations: [DashboardPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: NetworkService, useValue: networkServiceSpy },
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: ActionSheetController, useValue: actionSheetControllerSpy },
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: SmartlookService, useValue: smartlookServiceSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
        { provide: OrgUserSettingsService, useValue: orgUserSettingsServiceSpy },
        { provide: CategoriesService, useValue: categoriesServiceSpy },
        { provide: BackButtonService, useValue: backButtonServiceSpy },
        { provide: NavController, useValue: navControllerSpy },
        Platform,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {
                state: 'tasks',
              },
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    actionSheetController = TestBed.inject(ActionSheetController) as jasmine.SpyObj<ActionSheetController>;
    tasksService = TestBed.inject(TasksService) as jasmine.SpyObj<TasksService>;
    smartlookService = TestBed.inject(SmartlookService) as jasmine.SpyObj<SmartlookService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
    backButtonService = TestBed.inject(BackButtonService) as jasmine.SpyObj<BackButtonService>;
    platform = TestBed.inject(Platform);
    navController = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    fixture.detectChanges();
  }));

  function setRouterUrl(url: string) {
    Object.defineProperty(router, 'url', {
      get: () => url,
    });
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('displayedTaskCount():', () => {
    beforeEach(() => {
      const tasksComponentSpy = jasmine.createSpyObj('TasksComponent', [], { taskCount: 1 });
      component.tasksComponent = tasksComponentSpy;
      component.taskCount = 4;
    });

    it('should return the taskCount from task component if the state is not tasks', () => {
      activatedRoute.snapshot.queryParams.state = 'notTasks';
      expect(component.displayedTaskCount).toEqual(4);
    });

    it('should return the taskCount if the state is tasks', () => {
      activatedRoute.snapshot.queryParams.state = 'tasks';
      expect(component.displayedTaskCount).toEqual(1);
    });
  });

  it('get FooterState(): should return FooterState enum', () => {
    expect(component.FooterState).toEqual(FooterState);
  });

  it('get filterPills(): should return filterPills from tasksComponent', () => {
    const tasksComponentSpy = jasmine.createSpyObj('TasksComponent', [], { filterPills: creditTxnFilterPill });
    component.tasksComponent = tasksComponentSpy;
    expect(component.filterPills).toEqual(creditTxnFilterPill);
  });

  it('ionViewWillLeave(): should call unsubscribe hardware back button and set onPageExit to null', () => {
    spyOn(component.onPageExit$, 'next');
    component.hardwareBackButtonAction = new Subscription();
    spyOn(component.hardwareBackButtonAction, 'unsubscribe');
    component.ionViewWillLeave();
    expect(component.onPageExit$.next).toHaveBeenCalledWith(null);
    expect(component.hardwareBackButtonAction.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('setupNetworkWatcher(): should setup network watching', (done) => {
    networkService.connectivityWatcher.and.returnValue(null);
    networkService.isOnline.and.returnValue(of(true));

    component.setupNetworkWatcher();
    expect(networkService.connectivityWatcher).toHaveBeenCalledOnceWith(new EventEmitter<boolean>());
    expect(networkService.isOnline).toHaveBeenCalledTimes(1);
    component.isConnected$.subscribe((res) => {
      expect(res).toBeTrue();
      done();
    });
  });

  describe('ionViewWillEnter():', () => {
    beforeEach(() => {
      spyOn(component, 'setupNetworkWatcher');
      spyOn(component, 'registerBackButtonAction');
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      categoriesService.getMileageOrPerDiemCategories.and.returnValue(of(mileagePerDiemPlatformCategoryData));
      orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      spyOn(component, 'setupActionSheet');
      const statsComponentSpy = jasmine.createSpyObj('StatsComponent', ['init']);
      const cardStatsComponentSpy = jasmine.createSpyObj('CardStatsComponent', ['init']);
      const tasksComponentSpy = jasmine.createSpyObj('TasksComponent', ['init']);
      component.statsComponent = statsComponentSpy;
      component.cardStatsComponent = cardStatsComponentSpy;
      component.tasksComponent = tasksComponentSpy;
      tasksService.getTotalTaskCount.and.returnValue(of(4));
      component.isConnected$ = of(true);
    });

    it('should call setupNetworkWatcher, registerBackButtonAction and smartlookService.init once', () => {
      component.ionViewWillEnter();
      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
      expect(component.registerBackButtonAction).toHaveBeenCalledTimes(1);
      expect(smartlookService.init).toHaveBeenCalledTimes(1);
    });

    it('should set currentStateIndex to 1 if queryParams.state is tasks', () => {
      activatedRoute.snapshot.queryParams.state = 'tasks';
      component.ionViewWillEnter();
      expect(component.currentStateIndex).toEqual(1);
    });

    it('should set currentStateIndex to 0 if queryParams.state is not tasks', () => {
      activatedRoute.snapshot.queryParams.state = 'notTasks';
      component.ionViewWillEnter();
      expect(component.currentStateIndex).toEqual(0);
    });

    it('should set orgSettings$ equal to orgSettingsRes', () => {
      component.ionViewWillEnter();
      component.orgSettings$.subscribe((res) => {
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(res).toEqual(orgSettingsRes);
      });
    });

    it('should set orgUserSettings$ equal to orgUserSettingsData', () => {
      component.ionViewWillEnter();
      component.orgUserSettings$.subscribe((res) => {
        expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
        expect(res).toEqual(orgUserSettingsData);
      });
    });

    it('should set homeCurrency$ equal to USD', () => {
      component.ionViewWillEnter();
      component.homeCurrency$.subscribe((res) => {
        expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
        expect(res).toEqual('USD');
      });
    });

    it('should call setupActionSheet once with orgSettings data', () => {
      component.ionViewWillEnter();
      expect(component.setupActionSheet).toHaveBeenCalledOnceWith(orgSettingsRes, allowedExpenseTypes);
    });

    it('should call init method of statsComponent and tasksComponent', () => {
      component.ionViewWillEnter();
      expect(component.statsComponent.init).toHaveBeenCalledTimes(1);
      expect(component.cardStatsComponent.init).toHaveBeenCalledTimes(1);
      expect(component.tasksComponent.init).toHaveBeenCalledTimes(1);
    });

    it('should set taskCount equal to 4 if device is online', () => {
      component.ionViewWillEnter();
      expect(tasksService.getTotalTaskCount).toHaveBeenCalledTimes(1);
      expect(component.taskCount).toEqual(4);
    });

    it('should set taskCount equal to 0 if device is offline', () => {
      component.isConnected$ = of(false);
      component.ionViewWillEnter();
      expect(tasksService.getTotalTaskCount).not.toHaveBeenCalled();
      expect(component.taskCount).toEqual(0);
    });

    it('should navigate to my_dashboard page with queryParams.state as home if device is offline', () => {
      component.isConnected$ = of(false);
      component.ionViewWillEnter();
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'my_dashboard',
        {
          queryParams: { state: 'home' },
        },
      ]);
    });
  });

  describe('backButtonActionHandler():', () => {
    beforeEach(() => {
      setRouterUrl('/enterprise/my_dashboard');
      spyOn(component, 'onHomeClicked');
    });

    it('should call backButtonService.showAppCloseAlert once if url does not contain tasks', () => {
      component.backButtonActionHandler();
      expect(backButtonService.showAppCloseAlert).toHaveBeenCalledTimes(1);
      expect(component.onHomeClicked).not.toHaveBeenCalled();
      expect(navController.back).not.toHaveBeenCalled();
    });

    it('should call onHomeClicked once if url contains tasks and queryParams.tasksFilters is not present', () => {
      setRouterUrl('/enterprise/my_dashboard?state=tasks');
      component.backButtonActionHandler();
      expect(component.onHomeClicked).toHaveBeenCalledTimes(1);
      expect(backButtonService.showAppCloseAlert).not.toHaveBeenCalled();
      expect(navController.back).not.toHaveBeenCalled();
    });

    it('should call navController.back once if url contains tasks and queryParams.tasksFilters is present', () => {
      setRouterUrl('/enterprise/my_dashboard?state=tasks');
      activatedRoute.snapshot.queryParams.tasksFilters = 'expenses';
      component.backButtonActionHandler();
      expect(navController.back).toHaveBeenCalledTimes(1);
      expect(component.onHomeClicked).not.toHaveBeenCalled();
      expect(backButtonService.showAppCloseAlert).not.toHaveBeenCalled();
    });
  });

  it('registerBackButtonAction(): should call platform.backButton.subscribeWithPriority once with BackButtonActionPriority.LOW and backButtonActionHandler', () => {
    const backButtonActionHandlerSpy = spyOn(component, 'backButtonActionHandler');
    spyOn(platform.backButton, 'subscribeWithPriority').and.stub();
    component.registerBackButtonAction();
    expect(platform.backButton.subscribeWithPriority).toHaveBeenCalledOnceWith(
      BackButtonActionPriority.LOW,
      backButtonActionHandlerSpy
    );
  });

  it('onTaskClicked(): should set currentStateIndex to 1, navigate to tasks page with queryParams.state as tasks and track tasksPageOpened event', () => {
    component.onTaskClicked();
    expect(component.currentStateIndex).toEqual(1);
    expect(router.navigate).toHaveBeenCalledOnceWith([], {
      relativeTo: activatedRoute,
      queryParams: { state: 'tasks' },
    });
    expect(trackingService.tasksPageOpened).toHaveBeenCalledOnceWith({
      Asset: 'Mobile',
      from: 'Dashboard',
    });
  });

  it('openFilters(): should call tasksComponent.openFilters once', () => {
    const tasksComponentSpy = jasmine.createSpyObj('TasksComponent', ['openFilters']);
    component.tasksComponent = tasksComponentSpy;
    component.openFilters();
    expect(tasksComponentSpy.openFilters).toHaveBeenCalledTimes(1);
  });

  it('onCameraClicked(): should navigate to camera_overlay page', () => {
    component.onCameraClicked();
    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'camera_overlay',
      {
        navigate_back: true,
      },
    ]);
  });

  it('onHomeClicked(): should set currentStateIndex to 0, navigate to my_dashboard page with queryParams.state as home and track footerHomeTabClicked event', () => {
    component.onHomeClicked();
    expect(component.currentStateIndex).toEqual(0);
    expect(router.navigate).toHaveBeenCalledOnceWith([], {
      relativeTo: activatedRoute,
      queryParams: { state: 'home' },
    });
    expect(trackingService.footerHomeTabClicked).toHaveBeenCalledOnceWith({
      page: 'Dashboard',
    });
  });

  describe('actionSheetButtonsHandler():', () => {
    it('should call trackingService and navigate to add_edit_per_diem if action is add per diem', () => {
      const handler = component.actionSheetButtonsHandler('Add Per Diem', 'add_edit_per_diem');
      handler();
      expect(trackingService.dashboardActionSheetButtonClicked).toHaveBeenCalledOnceWith({
        Action: 'Add Per Diem',
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_per_diem',
        {
          navigate_back: true,
        },
      ]);
    });

    it('should call trackingService and navigate to add_edit_mileage if action is add mileage', () => {
      const handler = component.actionSheetButtonsHandler('Add Mileage', 'add_edit_mileage');
      handler();
      expect(trackingService.dashboardActionSheetButtonClicked).toHaveBeenCalledOnceWith({
        Action: 'Add Mileage',
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_mileage',
        {
          navigate_back: true,
        },
      ]);
    });

    it('should call trackingService and navigate to add_edit_expense if action is add expense', () => {
      const handler = component.actionSheetButtonsHandler('Add Expense', 'add_edit_expense');
      handler();
      expect(trackingService.dashboardActionSheetButtonClicked).toHaveBeenCalledOnceWith({
        Action: 'Add Expense',
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_expense',
        {
          navigate_back: true,
        },
      ]);
    });

    it('should call trackingService and navigate to camera_overlay if action is capture receipts', () => {
      const handler = component.actionSheetButtonsHandler('capture receipts', 'camera_overlay');
      handler();
      expect(trackingService.dashboardActionSheetButtonClicked).toHaveBeenCalledOnceWith({
        Action: 'capture receipts',
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'camera_overlay',
        {
          navigate_back: true,
        },
      ]);
    });
  });

  it('setupActionSheet(): should setup actionSheetButtons', () => {
    const mockOrgSettings = cloneDeep(orgSettingsRes);
    spyOn(component, 'actionSheetButtonsHandler');
    mockOrgSettings.per_diem.enabled = true;
    mockOrgSettings.mileage.enabled = true;
    component.setupActionSheet(mockOrgSettings, allowedExpenseTypes);
    expect(component.actionSheetButtons).toEqual(expectedActionSheetButtonRes);
  });

  it('openAddExpenseActionSheet(): should open actionSheetController and track event', fakeAsync(() => {
    const actionSheetSpy = jasmine.createSpyObj('actionSheet', ['present']);
    component.actionSheetButtons = expectedActionSheetButtonRes;
    actionSheetController.create.and.returnValue(actionSheetSpy);

    component.openAddExpenseActionSheet();
    tick(100);

    expect(trackingService.dashboardActionSheetOpened).toHaveBeenCalledTimes(1);
    expect(actionSheetController.create).toHaveBeenCalledOnceWith({
      header: 'ADD EXPENSE',
      mode: 'md',
      cssClass: 'fy-action-sheet',
      buttons: expectedActionSheetButtonRes,
    });
  }));
});
