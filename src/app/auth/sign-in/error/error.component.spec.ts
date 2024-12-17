import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

import { ErrorComponent } from './error.component';

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      declarations: [ErrorComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: PopoverController, useValue: popoverControllerSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorComponent);
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a default header', () => {
    expect(component.header).toEqual('Account does not Exist');
  });

  it('tryAgainClicked(): should dismiss the popover on try again button click', async () => {
    const tryAgainBtn = getElementBySelector(fixture, '.error-internal--primary-cta button') as HTMLButtonElement;
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
    it('should display the correct error message for status 401 and data is present', () => {
      component.error = { status: 401, data: { message: 'Invalid email or password' } };
      fixture.detectChanges();
      const errorMessage = getElementBySelector(fixture, '.error-internal--details');
      const resetLink = getElementBySelector(fixture, '.error-internal--redirect');
      expect(getTextContent(errorMessage)).toContain(
        'This email address will be temporarily locked after 5 unsuccessful login attempts. Try resetting your password?'
      );
      expect(resetLink).toBeTruthy();
    });

    it('should display the correct error message for status 400', () => {
      component.error = { status: 400 };
      fixture.detectChanges();
      const errorMessage = getElementBySelector(fixture, '.error-internal--details');
      expect(getTextContent(errorMessage)).toContain(
        'Your account is not verified. Please request a verification link, if required'
      );
    });

    it('should display the correct error message for status 500', () => {
      component.error = { status: 500 };
      fixture.detectChanges();
      const errorMessage = getElementBySelector(fixture, '.error-internal--details');
      const supportLink = getElementBySelector(fixture, 'a');
      expect(getTextContent(errorMessage)).toContain(
        'Please retry in a while. Send us a note to support@fylehq.com if the problem persists.'
      );
      expect(supportLink).toBeTruthy();
    });

    it('should display the correct error message for status 433', () => {
      component.error = { status: 433 };
      fixture.detectChanges();
      const errorMessage = getElementBySelector(fixture, '.error-internal--details');
      expect(getTextContent(errorMessage)).toContain(
        'This email address is locked temporarily, as there are too many unsuccessful login attempts recently. Please retry later.'
      );
    });

    it('should display the correct error message for status 401 and no data or message is present', () => {
      component.error = { status: 401 };
      fixture.detectChanges();
      const errorMessage = getElementBySelector(fixture, '.error-internal--details');
      expect(getTextContent(errorMessage)).toContain(
        'Your organization has restricted Fyle access to its corporate network.'
      );
    });
  });
});
