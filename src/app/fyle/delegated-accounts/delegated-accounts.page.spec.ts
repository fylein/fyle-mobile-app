import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { apiEouRes, eouRes2, eouRes3 } from 'src/app/core/mock-data/extended-org-user.data';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { OrgService } from 'src/app/core/services/org.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { DelegatedAccountsPage } from './delegated-accounts.page';

describe('DelegatedAccountsPage', () => {
  let component: DelegatedAccountsPage;
  let fixture: ComponentFixture<DelegatedAccountsPage>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let orgService: jasmine.SpyObj<OrgService>;
  let router: jasmine.SpyObj<Router>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let recentLocalStorageItemsService: jasmine.SpyObj<RecentLocalStorageItemsService>;

  beforeEach(waitForAsync(() => {
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', [
      'switchToDelegator',
      'switchToDelegatee',
      'findDelegatedAccounts',
      'excludeByStatus',
    ]);
    const orgServiceSpy = jasmine.createSpyObj('OrgService', ['getCurrentOrg']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['hideLoader', 'showLoader']);
    const recentLocalStorageItemsServiceSpy = jasmine.createSpyObj('RecentLocalStorageItemsService', [
      'clearRecentLocalStorageCache',
    ]);

    TestBed.configureTestingModule({
      declarations: [DelegatedAccountsPage],
      imports: [IonicModule.forRoot(), FormsModule],
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
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DelegatedAccountsPage);
    component = fixture.componentInstance;

    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    orgService = TestBed.inject(OrgService) as jasmine.SpyObj<OrgService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    recentLocalStorageItemsService = TestBed.inject(
      RecentLocalStorageItemsService
    ) as jasmine.SpyObj<RecentLocalStorageItemsService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('switchToDelegatee(): should switch delegatee', fakeAsync(() => {
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();
    recentLocalStorageItemsService.clearRecentLocalStorageCache.and.returnValue(null);
    orgUserService.switchToDelegator.and.returnValue(of(apiEouRes));

    component.switchToDelegatee(eouRes2);
    tick(500);

    expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    expect(recentLocalStorageItemsService.clearRecentLocalStorageCache).toHaveBeenCalledTimes(1);
    expect(orgUserService.switchToDelegator).toHaveBeenCalledOnceWith(eouRes2.ou);
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
      component.searchDelegatees = fixture.debugElement.query(By.css('.delegated--search-input'));
      const input = component.searchDelegatees.nativeElement as HTMLInputElement;
      activatedRoute.snapshot.params.switchToOwn = null;
      orgUserService.findDelegatedAccounts.and.returnValue(of([apiEouRes, eouRes2, eouRes3]));
      orgService.getCurrentOrg.and.returnValue(of(orgData1[0]));
      orgUserService.excludeByStatus.and.returnValue([eouRes2, eouRes3]);

      component.ionViewWillEnter();
      tick(500);

      input.value = 'ajain@fyle.in';
      input.dispatchEvent(new Event('keyup'));
      tick(500);

      expect(component.delegatedAccList).toEqual([eouRes2, eouRes3]);
      expect(orgUserService.findDelegatedAccounts).toHaveBeenCalledTimes(1);
      expect(orgService.getCurrentOrg).toHaveBeenCalledTimes(1);
      expect(orgUserService.excludeByStatus).toHaveBeenCalledWith([apiEouRes, eouRes2, eouRes3], 'DISABLED');
    }));

    it('should set delegatee acc list to empty array if no accounts are provided', fakeAsync(() => {
      component.searchDelegatees = fixture.debugElement.query(By.css('.delegated--search-input'));
      const input = component.searchDelegatees.nativeElement as HTMLInputElement;
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
      expect(orgUserService.excludeByStatus).toHaveBeenCalledWith([], 'DISABLED');
    }));
  });
});
