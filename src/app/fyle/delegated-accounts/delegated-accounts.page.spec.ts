import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { getElementRef } from 'src/app/core/dom-helpers';
import { apiEouRes, eouUnFlattended } from 'src/app/core/mock-data/extended-org-user.data';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';
import { OrgService } from 'src/app/core/services/org.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { DelegatedAccountsPage } from './delegated-accounts.page';
import { delegatorData } from 'src/app/core/mock-data/platform/v1/delegator.data';
import { AuthService } from 'src/app/core/services/auth.service';

describe('DelegatedAccountsPage', () => {
  let component: DelegatedAccountsPage;
  let fixture: ComponentFixture<DelegatedAccountsPage>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let employeesService: jasmine.SpyObj<EmployeesService>;
  let orgService: jasmine.SpyObj<OrgService>;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let recentLocalStorageItemsService: jasmine.SpyObj<RecentLocalStorageItemsService>;
  let navController: jasmine.SpyObj<NavController>;

  beforeEach(waitForAsync(() => {
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', [
      'switchToDelegator',
      'switchToDelegatee',
      'findDelegatedAccounts',
      'excludeByStatus',
      'getUserById',
    ]);
    const employeesServiceSpy = jasmine.createSpyObj('EmployeesService', ['getEmployeesByParams']);
    const orgServiceSpy = jasmine.createSpyObj('OrgService', ['getCurrentOrg']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['hideLoader', 'showLoader']);
    const recentLocalStorageItemsServiceSpy = jasmine.createSpyObj('RecentLocalStorageItemsService', [
      'clearRecentLocalStorageCache',
    ]);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['back']);

    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), FormsModule, DelegatedAccountsPage],
    providers: [
        {
            provide: ActivatedRoute,
            useValue: {
                snapshot: {
                    params: {
                        switchToOwn: true,
                    },
                },
            },
        },
        {
            provide: OrgUserService,
            useValue: orgUserServiceSpy,
        },
        {
            provide: OrgService,
            useValue: orgServiceSpy,
        },
        {
            provide: EmployeesService,
            useValue: employeesServiceSpy,
        },
        {
            provide: AuthService,
            useValue: authServiceSpy,
        },
        {
            provide: Router,
            useValue: routerSpy,
        },
        {
            provide: LoaderService,
            useValue: loaderServiceSpy,
        },
        {
            provide: RecentLocalStorageItemsService,
            useValue: recentLocalStorageItemsServiceSpy,
        },
        {
            provide: NavController,
            useValue: navControllerSpy,
        },
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
}).compileComponents();

    fixture = TestBed.createComponent(DelegatedAccountsPage);
    component = fixture.componentInstance;

    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    orgService = TestBed.inject(OrgService) as jasmine.SpyObj<OrgService>;
    employeesService = TestBed.inject(EmployeesService) as jasmine.SpyObj<EmployeesService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    recentLocalStorageItemsService = TestBed.inject(
      RecentLocalStorageItemsService,
    ) as jasmine.SpyObj<RecentLocalStorageItemsService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    navController = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('switchToDelegatee(): should switch delegatee', fakeAsync(() => {
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();
    recentLocalStorageItemsService.clearRecentLocalStorageCache.and.returnValue(null);
    orgUserService.switchToDelegator.and.returnValue(of(eouUnFlattended));
    authService.getEou.and.resolveTo(eouUnFlattended);

    component.switchToDelegatee(delegatorData);
    tick(500);

    expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    expect(recentLocalStorageItemsService.clearRecentLocalStorageCache).toHaveBeenCalledTimes(1);
    expect(orgUserService.switchToDelegator).toHaveBeenCalledOnceWith(delegatorData.user_id, eouUnFlattended.ou.org_id);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard']);
  }));

  describe('ionViewWillEnter():', () => {
    it('should switch to own account if enabled', fakeAsync(() => {
      loaderService.showLoader.and.resolveTo(null);
      loaderService.hideLoader.and.resolveTo(null);
      recentLocalStorageItemsService.clearRecentLocalStorageCache.and.returnValue(null);
      orgUserService.switchToDelegatee.and.returnValue(of(apiEouRes));

      component.ionViewWillEnter();
      tick(500);

      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(recentLocalStorageItemsService.clearRecentLocalStorageCache).toHaveBeenCalledTimes(1);
      expect(orgUserService.switchToDelegatee).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard']);
    }));

    it('should allow user to search and select a delegatee account', fakeAsync(() => {
      component.searchDelegatees = getElementRef(fixture, '.delegated--search-input');
      const input = component.searchDelegatees.nativeElement;
      activatedRoute.snapshot.params.switchToOwn = null;
      orgUserService.findDelegatedAccounts.and.returnValue(of([delegatorData]));
      orgService.getCurrentOrg.and.returnValue(of(orgData1[0]));

      component.ionViewWillEnter();
      tick(500);

      input.value = 'test@mail.com';
      input.dispatchEvent(new Event('keyup'));
      tick(500);

      expect(component.delegatedAccList).toEqual([delegatorData]);
      expect(orgUserService.findDelegatedAccounts).toHaveBeenCalledTimes(1);
      expect(orgService.getCurrentOrg).toHaveBeenCalledTimes(1);
    }));

    it('should set delegatee acc list to empty array if no accounts are provided', fakeAsync(() => {
      component.searchDelegatees = getElementRef(fixture, '.delegated--search-input');
      const input = component.searchDelegatees.nativeElement;
      activatedRoute.snapshot.params.switchToOwn = null;
      orgUserService.findDelegatedAccounts.and.returnValue(of([]));
      orgService.getCurrentOrg.and.returnValue(of(orgData1[0]));
      orgUserService.excludeByStatus.and.returnValue(null);

      component.ionViewWillEnter();
      tick(500);

      input.value = 'ajain@fyle.in';
      input.dispatchEvent(new Event('keyup'));
      tick(500);

      expect(component.delegatedAccList).toEqual([]);
      expect(orgUserService.findDelegatedAccounts).toHaveBeenCalledTimes(1);
      expect(orgService.getCurrentOrg).toHaveBeenCalledTimes(1);
    }));
  });
});
