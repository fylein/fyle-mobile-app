import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { UpdateMobileNumberComponent } from './update-mobile-number.component';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { FormsModule } from '@angular/forms';
import { FormButtonValidationDirective } from 'src/app/shared/directive/form-button-validation.directive';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { cloneDeep } from 'lodash';
import { of, throwError } from 'rxjs';

describe('UpdateMobileNumberComponent', () => {
  let component: UpdateMobileNumberComponent;
  let fixture: ComponentFixture<UpdateMobileNumberComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let authService: jasmine.SpyObj<AuthService>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['refreshEou']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['postOrgUser']);

    TestBed.configureTestingModule({
      declarations: [UpdateMobileNumberComponent, FormButtonValidationDirective],
      imports: [IonicModule.forRoot(), FormsModule, MatIconModule, MatIconTestingModule],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: OrgUserService,
          useValue: orgUserServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(UpdateMobileNumberComponent);
    component = fixture.componentInstance;

    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;

    component.extendedOrgUser = apiEouRes;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit(): ', () => {
    it('should set inputValue to mobile number', () => {
      expect(component.inputValue).toEqual('123456');
    });

    it('should set inputValue to empty string if mobile number is not present', () => {
      const extendedOrgUser = cloneDeep(apiEouRes);
      extendedOrgUser.ou.mobile = null;
      component.extendedOrgUser = extendedOrgUser;
      component.ngOnInit();
      expect(component.inputValue).toEqual('');
    });
  });

  it('ngAfterViewInit(): should focus on input element after view is initialized', () => {
    const inputElement = getElementBySelector(fixture, 'input') as HTMLInputElement;
    component.inputEl.nativeElement = inputElement;

    expect(document.activeElement).toBe(inputElement);
  });

  it('closePopover(): should dismiss the modal', () => {
    popoverController.dismiss.and.resolveTo();
    const closeCta = getElementBySelector(fixture, 'ion-button') as HTMLIonButtonElement;
    click(closeCta);

    expect(popoverController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('validateInput(): should set error message if input is invalid', () => {
    const valueErrorMapping = [
      {
        value: null,
        error: 'Please enter a Mobile Number',
      },
      {
        value: '',
        error: 'Please enter a Mobile Number',
      },
      {
        value: '123+98',
        error: 'Please enter a valid mobile number with country code. e.g. +12025559975',
      },
      {
        value: '8080913866',
        error: 'Please enter a valid mobile number with country code. e.g. +12025559975',
      },
      {
        value: '+918080913866',
        error: null,
      },
    ];

    valueErrorMapping.forEach((valueError) => {
      component.error = null;
      component.inputValue = valueError.value;

      component.validateInput();
      fixture.detectChanges();

      const errorElement = getElementBySelector(
        fixture,
        '.update-mobile-number--input-container__error'
      ) as HTMLSpanElement;
      expect(component.error).toEqual(valueError.error);

      if (valueError.error) {
        expect(getTextContent(errorElement)).toEqual(valueError.error);
      } else {
        expect(errorElement).toBeNull();
      }
    });
  });

  it('onFocus(): should clear error on clicking input', () => {
    spyOn(component, 'onFocus').and.callThrough();
    component.error = 'Please enter a Mobile Number';

    const inputElement = getElementBySelector(fixture, 'input') as HTMLInputElement;
    inputElement.dispatchEvent(new FocusEvent('focus'));

    expect(component.onFocus).toHaveBeenCalledOnceWith();
    expect(component.error).toBeNull();
  });

  describe('saveValue(): ', () => {
    let submitCta: HTMLButtonElement;
    beforeEach(() => {
      spyOn(component, 'saveValue').and.callThrough();
      spyOn(component, 'validateInput');
      orgUserService.postOrgUser.and.returnValue(of(null));
      authService.refreshEou.and.returnValue(of(null));

      component.error = null;
      component.inputValue = '+911234566756';
      submitCta = getElementBySelector(fixture, '.update-mobile-number--toolbar__btn') as HTMLButtonElement;
    });

    it('should save mobile number if entered value is valid', () => {
      click(submitCta);

      const orgUserDetails = {
        ...component.extendedOrgUser.ou,
        mobile: component.inputValue,
      };

      expect(component.saveValue).toHaveBeenCalledOnceWith();
      expect(component.validateInput).toHaveBeenCalledOnceWith();
      expect(orgUserService.postOrgUser).toHaveBeenCalledOnceWith(orgUserDetails);
      expect(authService.refreshEou).toHaveBeenCalledOnceWith();
      expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ action: 'SUCCESS' });
    });

    it('should dismiss popover with error action if the api call fails', () => {
      orgUserService.postOrgUser.and.returnValue(throwError(() => 'Error'));
      click(submitCta);

      const orgUserDetails = {
        ...component.extendedOrgUser.ou,
        mobile: component.inputValue,
      };

      expect(component.saveValue).toHaveBeenCalledOnceWith();
      expect(component.validateInput).toHaveBeenCalledOnceWith();
      expect(orgUserService.postOrgUser).toHaveBeenCalledOnceWith(orgUserDetails);
      expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ action: 'ERROR' });
    });

    it('should not save mobile number if it is invalid', () => {
      component.error = 'Please enter a Mobile Number';
      click(submitCta);
      expect(component.saveValue).toHaveBeenCalledOnceWith();
      expect(component.validateInput).toHaveBeenCalledOnceWith();
      expect(orgUserService.postOrgUser).not.toHaveBeenCalled();
    });
  });
});
