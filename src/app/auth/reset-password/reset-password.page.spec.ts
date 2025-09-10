import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ResetPasswordPage } from './reset-password.page';
import { ReactiveFormsModule, FormsModule, UntypedFormBuilder, Validators, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { PageState } from 'src/app/core/models/page-state.enum';
import { getElementRef } from 'src/app/core/dom-helpers';
import { DebugElement } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';

describe('ResetPasswordPage', () => {
  let component: ResetPasswordPage;
  let fixture: ComponentFixture<ResetPasswordPage>;
  let router: jasmine.SpyObj<Router>;
  let routerAuthService: jasmine.SpyObj<RouterAuthService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarPropertiesService: jasmine.SpyObj<SnackbarPropertiesService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let formBuilder: jasmine.SpyObj<UntypedFormBuilder>;
  let fb: UntypedFormBuilder;

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const routerAuthServiceSpy = jasmine.createSpyObj('RouterAuthService', ['sendResetPassword']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesServiceSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        ResetPasswordPage,
      ],
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
          useValue: { snapshot: { params: { email: 'aastha.b@fyle.in' }, queryParams: { tmp_pwd_expired: 'true' } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    routerAuthService = TestBed.inject(RouterAuthService) as jasmine.SpyObj<RouterAuthService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarPropertiesService = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    fb = TestBed.inject(UntypedFormBuilder);
    component.fg = fb.group({
      email: [Validators.compose([Validators.required, Validators.pattern('\\S+@\\S+\\.\\S{2,}')])],
    });
    fixture.detectChanges();
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set current page state on component creation', () => {
    component.ionViewWillEnter();
    expect(component.currentPageState).toEqual(PageState.notSent);
  });

  describe('template', () => {
    it('should render the form in "notSent" state', () => {
      component.currentPageState = component.PageState.notSent;
      fixture.detectChanges();

      const formElement = fixture.debugElement.query(By.css('.forgot-password__form-container'));
      expect(formElement).toBeTruthy();
    });

    it('should render the success message in "success" state', () => {
      component.currentPageState = component.PageState.success;
      component.resetEmail = 'test@example.com';
      fixture.detectChanges();

      const successMessageElement = fixture.debugElement.query(By.css('.forgot-password__success-message'));
      expect(successMessageElement).toBeTruthy();

      const emailElement = fixture.debugElement.query(By.css('.forgot-password__content__reset-email'));
      expect(emailElement.nativeElement.textContent).toContain('test@example.com');
    });

    it('should display validation error for invalid email input', () => {
      component.currentPageState = PageState.notSent;
      const emailControl = component.fg.controls.email;
      emailControl.setValue('invalid-email');
      emailControl.markAsTouched();
      fixture.detectChanges();

      const errorElement = getElementRef(fixture, '.forgot-password__error-message');
      expect(errorElement.nativeElement.textContent).toContain(' Enter an email address. ');
    });

    it('should call sendResetLink with correct email when button is clicked', () => {
      component.currentPageState = PageState.notSent;
      spyOn(component, 'sendResetLink');
      component.fg.controls.email.setValue('test@example.com');
      fixture.detectChanges();

      const buttonElement = fixture.debugElement.query(By.css('ion-button'));
      buttonElement.triggerEventHandler('click', null);

      expect(component.sendResetLink).toHaveBeenCalledWith('test@example.com');
    });

    it('should display resend link if email is not sent', () => {
      component.isEmailSentOnce = false;
      component.isLoading = false;
      component.currentPageState = component.PageState.success;
      component.resetEmail = 'test@example.com';
      fixture.detectChanges();

      const resendLink = fixture.debugElement.query(By.css('.forgot-password__resend-text__resend-link'));
      expect(resendLink).toBeTruthy();
    });

    it('should hide resend link and show spinner when loading', () => {
      component.isEmailSentOnce = false;
      component.isLoading = true;
      component.currentPageState = component.PageState.success;
      fixture.detectChanges();

      const resendLink = getElementRef(fixture, '.forgot-password__resend-text__resend-link') as DebugElement;
      expect(resendLink).toBeFalsy();

      const spinner = getElementRef(fixture, 'ion-spinner') as DebugElement;
      expect(spinner).toBeTruthy();
    });
  });

  describe('sendResetLink():', () => {
    beforeEach(() => {
      component.currentPageState = PageState.success;
    });

    it('should send reset password link, change loading and page state to success', fakeAsync(() => {
      routerAuthService.sendResetPassword.and.returnValue(of({}));

      const email = 'jay.b@fyle.in';
      component.sendResetLink(email);
      tick();
      expect(component.isLoading).toBeFalse();
      expect(component.currentPageState).toEqual(PageState.success);
    }));

    it('should send reset password link, change loading and page state', () => {
      routerAuthService.sendResetPassword.and.returnValue(throwError(() => new Error('Error message')));
      spyOn(component, 'handleError').and.callThrough();

      const email = 'jay.b@fyle.in';
      component.sendResetLink(email);
      expect(component.isLoading).toBeFalse();
      expect(component.handleError).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleError(): ', () => {
    it('should navigate to disabled page on 422 error', () => {
      const error = { status: 422 };
      component.handleError(error);

      expect(router.navigate).toHaveBeenCalledWith(['/', 'auth', 'disabled']);
    });

    it('should display error message on other errors', () => {
      const error = { status: 401 };
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
    expect(router.navigate).toHaveBeenCalledWith([
      '/',
      'auth',
      'sign_in',
      { email: component.fg.controls.email.value },
    ]);
  });
});
