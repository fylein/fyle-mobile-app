import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

import { PendingVerificationPage } from './pending-verification.page';
import { PageState } from 'src/app/core/models/page-state.enum';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { of, throwError } from 'rxjs';
import { authResData1 } from 'src/app/core/mock-data/auth-reponse.data';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('PendingVerificationPage', () => {
  let component: PendingVerificationPage;
  let fixture: ComponentFixture<PendingVerificationPage>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let routerAuthService: jasmine.SpyObj<RouterAuthService>;

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const routerAuthServiceSpy = jasmine.createSpyObj('RouterAuthService', ['resendVerificationLink']);

    TestBed.configureTestingModule({
      declarations: [PendingVerificationPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { orgId: 'orNVthTo2Zyo' } } },
        },
        {
          provide: RouterAuthService,
          useValue: routerAuthServiceSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingVerificationPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    routerAuthService = TestBed.inject(RouterAuthService) as jasmine.SpyObj<RouterAuthService>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set hasTokenExpired to true if snapshot.params.hasTokenExpired is defined and true on ionViewWillEnter()', () => {
    activatedRoute.snapshot.params.hasTokenExpired = true;
    component.ionViewWillEnter();
    expect(component.hasTokenExpired).toBe(true);
  });

  it('should set hasTokenExpired to false if snapshot.params.hasTokenExpired is defined and false on ionViewWillEnter()', () => {
    activatedRoute.snapshot.params.hasTokenExpired = false;
    component.ionViewWillEnter();
    expect(component.hasTokenExpired).toBe(false);
  });

  it('should set hasTokenExpired to false and currentPageState to notSent if snapshot.params.hasTokenExpired is not defined on ionViewWillEnter()', () => {
    component.ionViewWillEnter();
    expect(component.hasTokenExpired).toBe(false);
    expect(component.currentPageState).toEqual(PageState.notSent);
  });

  it('resendVerificationLink(): should call routerAuthService and set PageState to success if API is successful', fakeAsync(() => {
    const data = {
      cluster_domain: authResData1.cluster_domain,
    };
    routerAuthService.resendVerificationLink.and.returnValue(of(data));
    component.resendVerificationLink('ajain@fyle.in');
    tick(1000);
    expect(routerAuthService.resendVerificationLink).toHaveBeenCalledOnceWith('ajain@fyle.in', 'orNVthTo2Zyo');
    expect(component.isLoading).toBeFalse();
    expect(component.currentPageState).toEqual(PageState.success);
  }));

  it('resendVerificationLink(): should call routerAuthService and call handleError if API is unsuccessful', fakeAsync(() => {
    const error = new Error('An Error Occured');
    routerAuthService.resendVerificationLink.and.returnValue(throwError(() => error));
    spyOn(component, 'handleError');
    component.resendVerificationLink('ajain@fyle.in');
    tick(1000);
    expect(routerAuthService.resendVerificationLink).toHaveBeenCalledOnceWith('ajain@fyle.in', 'orNVthTo2Zyo');
    expect(component.isLoading).toBeTrue();
    expect(component.currentPageState).not.toEqual(PageState.success);
    expect(component.handleError).toHaveBeenCalledOnceWith(error);
  }));

  it('handleError(); should navigate to auth/disabled if status code is 422', () => {
    const error = {
      status: 422,
    };
    component.handleError(error);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'disabled']);
    expect(component.currentPageState).not.toEqual(PageState.failure);
  });

  it('handleError(); should set pagestate to failure if status code is something else', () => {
    const error = {
      status: 400,
    };
    component.handleError(error);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.currentPageState).toEqual(PageState.failure);
  });
});
