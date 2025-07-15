import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { PendingVerificationPage } from './pending-verification.page';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { of, throwError } from 'rxjs';
import { authResData1 } from 'src/app/core/mock-data/auth-response.data';
import { By } from '@angular/platform-browser';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { HttpErrorResponse } from '@angular/common/http';
import { getElementRef } from 'src/app/core/dom-helpers';

describe('PendingVerificationPage', () => {
  let component: PendingVerificationPage;
  let fixture: ComponentFixture<PendingVerificationPage>;
  let router: jasmine.SpyObj<Router>;
  let routerAuthService: jasmine.SpyObj<RouterAuthService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarPropertiesService: jasmine.SpyObj<SnackbarPropertiesService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let formBuilder: jasmine.SpyObj<UntypedFormBuilder>;
  let fb: UntypedFormBuilder;

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const routerAuthServiceSpy = jasmine.createSpyObj('RouterAuthService', ['resendVerificationLink']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesServiceSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    TestBed.configureTestingModule({
      declarations: [PendingVerificationPage],
      imports: [IonicModule.forRoot(), RouterTestingModule, RouterModule, FormsModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: RouterAuthService,
          useValue: routerAuthServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: MatSnackBar,
          useValue: matSnackBarSpy,
        },
        {
          provide: SnackbarPropertiesService,
          useValue: snackbarPropertiesServiceSpy,
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { email: 'aastha.b@fyle.in' } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingVerificationPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    routerAuthService = TestBed.inject(RouterAuthService) as jasmine.SpyObj<RouterAuthService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarPropertiesService = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    fb = TestBed.inject(UntypedFormBuilder);
    activatedRoute.snapshot.params.orgId = 'orNVthTo2Zyo';
    component.fg = fb.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern('\\S+@\\S+\\.\\S{2,}')])],
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
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
  }));

  it('resendVerificationLink(): should call routerAuthService and call handleError if API is unsuccessful', fakeAsync(() => {
    const error = { status: 500 } as HttpErrorResponse;
    routerAuthService.resendVerificationLink.and.returnValue(throwError(() => error));
    spyOn(component, 'handleError');
    component.resendVerificationLink('ajain@fyle.in');
    tick(1000);
    expect(routerAuthService.resendVerificationLink).toHaveBeenCalledOnceWith('ajain@fyle.in', 'orNVthTo2Zyo');
    expect(component.isLoading).toBeTrue();
    expect(component.handleError).toHaveBeenCalledOnceWith(error);
  }));

  describe('handleError():', () => {
    it('handleError(); should navigate to auth/disabled if status code is 422', () => {
      const error = {
        status: 422,
      } as HttpErrorResponse;
      component.handleError(error);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'disabled']);
    });

    it('should display error message on other errors', () => {
      const error = { status: 401 } as HttpErrorResponse;
      const props = {
        panelClass: ['msb-failure'],
      };

      matSnackBar.openFromComponent.and.callThrough();

      component.handleError(error);
      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...props,
        panelClass: ['msb-failure'],
      });
      expect(snackbarPropertiesService.setSnackbarProperties).toHaveBeenCalledTimes(1);
    });
  });

  it('onGotoSignInClick(): should navigate to sign-in page', () => {
    component.onGotoSignInClick();
    expect(router.navigate).toHaveBeenCalledWith(['/', 'auth', 'sign_in']);
  });

  describe('template', () => {
    it('should render the form for entering email', () => {
      component.isInvitationLinkSent = false;
      fixture.detectChanges();

      const formElement = fixture.debugElement.query(By.css('.pending-verification__form-container'));
      expect(formElement).toBeTruthy();
    });

    it('should display validation error for invalid email input', () => {
      component.isInvitationLinkSent = false;
      const emailControl = component.fg.controls.email;
      emailControl.setValue('invalid-email');
      emailControl.markAsTouched();
      fixture.detectChanges();

      const errorElement = getElementRef(fixture, '.pending-verification__error-message');
      expect(errorElement.nativeElement.textContent).toContain('Please enter a valid email.');
    });

    it('should call resendVerificationLink with correct email when button is clicked', () => {
      component.isInvitationLinkSent = false;
      spyOn(component, 'resendVerificationLink');
      component.fg.controls.email.setValue('test@example.com');
      fixture.detectChanges();

      const buttonElement = fixture.debugElement.query(By.css('ion-button'));
      buttonElement.triggerEventHandler('click', null);

      expect(component.resendVerificationLink).toHaveBeenCalledWith('test@example.com');
    });
  });
});
