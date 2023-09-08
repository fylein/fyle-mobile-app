import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
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
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FooterState } from 'src/app/shared/components/footer/footer-state';
import { Subject, Subscription } from 'rxjs';
import { creditTxnFilterPill } from 'src/app/core/mock-data/filter-pills.data';

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
    ]);
    let actionSheetControllerSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    let tasksServiceSpy = jasmine.createSpyObj('TasksService', ['getTotalTaskCount']);
    let smartlookServiceSpy = jasmine.createSpyObj('SmartlookService', ['init']);
    let orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    let orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get']);
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
    backButtonService = TestBed.inject(BackButtonService) as jasmine.SpyObj<BackButtonService>;
    platform = TestBed.inject(Platform);
    navController = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    fixture.detectChanges();
  }));

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
});
