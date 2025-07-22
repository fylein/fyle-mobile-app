import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

import { ErrorComponent } from './error.component';
import { of } from 'rxjs';

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let router: jasmine.SpyObj<Router>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    translocoServiceSpy.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'error.accountDoesNotExist': 'Account does not exist',
        'error.lockedWarning':
          'This email address will be temporarily locked after 5 unsuccessful login attempts. Would you like to try',
        'error.resettingLink': 'resetting',
        'error.yourPassword': 'your password?',
        'error.notVerified': 'Your account is not verified. Please request a verification link, if required',
        'error.serverError':
          'Please retry in a while. Send us a note to <a href="mailto:support@fylehq.com">support@fylehq.com</a> if the problem persists.',
        'error.temporarilyLocked':
          'This email address is locked temporarily, as there are too many unsuccessful login attempts recently. Please retry later.',
        'error.restrictedAccess': 'Your organization has restricted Fyle access to its corporate network.',
        'error.tryAgain': 'Try again',
      };
      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{{${paramKey}}}`;
          translation = translation.replace(placeholder, params[paramKey]);
        });
      }

      return translation;
    });
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), TranslocoModule, ErrorComponent],
      providers: [
        { provide: PopoverController, useValue: popoverControllerSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TranslocoService, useValue: translocoServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorComponent);
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a default header', () => {
    expect(component.header).toEqual('Account does not exist');
  });

  it('closePopover(): should dismiss the popover on try again button click', async () => {
    const tryAgainBtn = getElementBySelector(fixture, '.error-internal__primary-cta ion-button') as HTMLButtonElement;
    click(tryAgainBtn);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(popoverController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('routeTo(): should navigate to reset password page when clicked on try reset password', async () => {
    const route = ['/', 'auth', 'reset_password'];
    component.routeTo(route);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.navigate).toHaveBeenCalledOnceWith(route);
    expect(popoverController.dismiss).toHaveBeenCalledTimes(1);
  });

  describe('template:', () => {
    it('should display the correct error message for status 401 and data is present', fakeAsync(() => {
      component.error = { status: 401, data: { message: 'Invalid email or password' } };
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const errorMessage = getElementBySelector(fixture, '.error-internal__details');
      const resetLink = getElementBySelector(fixture, '.error-internal__redirect');
      expect(getTextContent(errorMessage)).toContain(
        'This email address will be temporarily locked after 5 unsuccessful login attempts. Would you like to try resetting your password?'
      );
      expect(resetLink).toBeTruthy();
    }));

    it('should display the correct error message for status 400', fakeAsync(() => {
      component.error = { status: 400 };
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const errorMessage = getElementBySelector(fixture, '.error-internal__details');
      expect(getTextContent(errorMessage)).toContain(
        'Your account is not verified. Please request a verification link, if required'
      );
    }));

    it('should display the correct error message for status 500', fakeAsync(() => {
      component.error = { status: 500 };
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const errorMessage = getElementBySelector(fixture, '.error-internal__details');
      const supportLink = getElementBySelector(fixture, 'a');
      expect(getTextContent(errorMessage)).toContain(
        'Please retry in a while. Send us a note to support@fylehq.com if the problem persists.'
      );
      expect(supportLink).toBeTruthy();
    }));

    it('should display the correct error message for status 433', fakeAsync(() => {
      component.error = { status: 433 };
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const errorMessage = getElementBySelector(fixture, '.error-internal__details');
      expect(getTextContent(errorMessage)).toContain(
        'This email address is locked temporarily, as there are too many unsuccessful login attempts recently. Please retry later.'
      );
    }));

    it('should display the correct error message for status 401 and no data or message is present', fakeAsync(() => {
      component.error = { status: 401 };
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const errorMessage = getElementBySelector(fixture, '.error-internal__details');
      expect(getTextContent(errorMessage)).toContain(
        'Your organization has restricted Fyle access to its corporate network.'
      );
    }));
  });
});
