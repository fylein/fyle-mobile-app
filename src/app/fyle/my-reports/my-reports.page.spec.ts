import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';

import { MyReportsPage } from './my-reports.page';
import { TasksService } from 'src/app/core/services/tasks.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ReportService } from 'src/app/core/services/report.service';
import { ApiV2Service } from 'src/app/core/services/api-v2.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, fromEvent, of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReportState } from 'src/app/shared/pipes/report-state.pipe';
import { orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';

fdescribe('MyReportsPage', () => {
  let component: MyReportsPage;
  let fixture: ComponentFixture<MyReportsPage>;
  let tasksService: jasmine.SpyObj<TasksService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let reportService: jasmine.SpyObj<ReportService>;
  let apiV2Service: jasmine.SpyObj<ApiV2Service>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let router: jasmine.SpyObj<Router>;
  let navController: jasmine.SpyObj<NavController>;
  let inputElement: HTMLInputElement;

  beforeEach(waitForAsync(() => {
    tasksService = jasmine.createSpyObj('TasksService', ['getReportsTaskCount']);
    currencyService = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    reportService = jasmine.createSpyObj('ReportService', ['getMyReportsCount', 'getMyReports']);
    apiV2Service = jasmine.createSpyObj('ApiV2Service', ['extendQueryParamsForTextSearch']);
    transactionService = jasmine.createSpyObj('TransactionService', ['getTransactionStats']);
    orgSettingsService = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['back']);

    TestBed.configureTestingModule({
      declarations: [MyReportsPage, ReportState],
      imports: [IonicModule.forRoot(), RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: TasksService, useValue: tasksService },
        { provide: CurrencyService, useValue: currencyService },
        { provide: ReportService, useValue: reportService },
        { provide: ApiV2Service, useValue: apiV2Service },
        { provide: TransactionService, useValue: transactionService },
        { provide: OrgSettingsService, useValue: orgSettingsService },
        { provide: ActivatedRoute, useValue: jasmine.createSpyObj('ActivatedRoute', ['snapshot']) },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']) },
        {
          provide: NavController,
          useValue: navControllerSpy,
        },
        ReportState,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyReportsPage);
    component = fixture.componentInstance;

    const activatedRouteSnapshot = TestBed.inject(ActivatedRoute).snapshot;
    activatedRouteSnapshot.params = {};
    activatedRouteSnapshot.queryParams = {};

    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    navController = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component properties and load data', fakeAsync(() => {
    const searchText = 'example';
    const loadDataSubject = new BehaviorSubject({ pageNumber: 1 });
    component.loadData$ = loadDataSubject;

    const paginatedPipeValue = { count: 2, offset: 0, data: ['item1', 'item2'] };
    const reportServiceCount = 10;
    const countSubject = new BehaviorSubject(reportServiceCount);

    reportService.getMyReportsCount.and.returnValue(countSubject);

    const homeCurrency = 'USD';
    currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));
    tasksService.getReportsTaskCount.and.returnValue(of(5));
    currencyService.getHomeCurrency.and.returnValue(of('USD'));
    orgSettingsService.get.and.returnValue(of(orgSettingsRes));

    component.simpleSearchInput = fixture.debugElement.query(By.css('.my-reports--simple-search-input'));

    inputElement = component.simpleSearchInput.nativeElement;

    component.ionViewWillEnter();

    fixture.detectChanges();

    inputElement.value = '';

    inputElement.dispatchEvent(new Event('keyup'));

    tick(1000);

    expect(tasksService.getReportsTaskCount).toHaveBeenCalled();

    expect(component.reportsTaskCount).toEqual(5);
    expect(component.isLoading).toBeTrue();

    expect(component.searchText).toEqual('');
    expect(component.navigateBack).toBeFalse();
    expect(component.acc).toEqual([]);

    expect(component.currentPageNumber).toEqual(1);
    expect(component.loadData$).toBeDefined();
    expect(currencyService.getHomeCurrency).toHaveBeenCalled();
    expect(component.homeCurrency$).toBeDefined();

    expect(component.simpleSearchInput.nativeElement.value).toEqual('');
    expect(component.loadData$.getValue().searchString).toEqual(searchText);
    expect(component.currentPageNumber).toEqual(1);
    expect(component.loadData$.getValue().pageNumber).toEqual(component.currentPageNumber);

    expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalled();
    expect(reportService.getMyReportsCount).toHaveBeenCalledWith(jasmine.any(Object));
    expect(reportService.getMyReports).toHaveBeenCalledWith(jasmine.any(Object));

    expect(component.isLoadingDataInInfiniteScroll).toBeFalse();
    expect(component.acc).toEqual(paginatedPipeValue.data);

    expect(component.myReports$).toBeDefined();
    expect(component.count$).toBeDefined();
    expect(component.isInfiniteScrollRequired$).toBeDefined();

    expect(router.navigate).toHaveBeenCalled();

    expect(component.expensesAmountStats$).toBeDefined();
    expect(component.simplifyReportsSettings$).toBeDefined();
    expect(component.nonReimbursableOrg$).toBeDefined();

    expect(component.myReports$).toHaveBeenCalledTimes(1);
    expect(component.count$).toHaveBeenCalledTimes(1);
    expect(component.isInfiniteScrollRequired$).toHaveBeenCalledTimes(1);

    expect(component.filters).toEqual({});
    expect(component.currentPageNumber).toEqual(1);
    expect(component.loadData$.next).toHaveBeenCalledWith(jasmine.any(Object));
    expect(component.filterPills).toEqual(jasmine.any(Array));
  }));
});
