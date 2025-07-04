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
import { valueErrorMapping } from 'src/app/core/mock-data/value-error-mapping-for-update-mobile-number-popover.data';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';

describe('UpdateMobileNumberComponent', () => {
  let component: UpdateMobileNumberComponent;
  let fixture: ComponentFixture<UpdateMobileNumberComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let authService: jasmine.SpyObj<AuthService>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['refreshEou']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['postOrgUser']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });

    TestBed.configureTestingModule({
      declarations: [UpdateMobileNumberComponent, FormButtonValidationDirective],
      imports: [IonicModule.forRoot(), FormsModule, MatIconModule, MatIconTestingModule, TranslocoModule],
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
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(UpdateMobileNumberComponent);
    component = fixture.componentInstance;

    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'updateMobileNumber.errorEnterNumber': 'Enter mobile number',
        'updateMobileNumber.errorEnterNumberWithCountryCode': 'Enter mobile number with country code',
        'updateMobileNumber.enterInputLabel': 'Enter {{inputLabel}}',
        'updateMobileNumber.saving': 'Saving...',
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
    component.error = 'Enter mobile number';

    const inputElement = getElementBySelector(fixture, 'input') as HTMLInputElement;
    inputElement.dispatchEvent(new FocusEvent('focus'));

    expect(component.onFocus).toHaveBeenCalledOnceWith();
    expect(component.error).toBeNull();
  });

  describe('saveValue(): ', () => {
    beforeEach(() => {
      spyOn(component, 'validateInput');
      orgUserService.postOrgUser.and.returnValue(of(null));
      authService.refreshEou.and.returnValue(of(null));

      component.error = null;
      component.inputValue = '+911234566756';
    });

    it('should close modal if mobile number is verified and user has not changed it', () => {
      const extendedOrgUser = cloneDeep(apiEouRes);
      extendedOrgUser.ou.mobile = '+911234566756';
      extendedOrgUser.ou.mobile_verified = true;
      component.extendedOrgUser = extendedOrgUser;

      component.saveValue();

      expect(popoverController.dismiss).toHaveBeenCalledOnceWith();
      expect(orgUserService.postOrgUser).not.toHaveBeenCalled();
    });

    it('should save mobile number if entered value is valid', () => {
      component.saveValue();

      const orgUserDetails = {
        ...component.extendedOrgUser.ou,
        mobile: component.inputValue,
      };

      expect(component.validateInput).toHaveBeenCalledOnceWith();
      expect(orgUserService.postOrgUser).toHaveBeenCalledOnceWith(orgUserDetails);
      expect(authService.refreshEou).toHaveBeenCalledOnceWith();
      expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ action: 'SUCCESS' });
    });

    it('should dismiss popover with error action if the api call fails', () => {
      orgUserService.postOrgUser.and.returnValue(throwError(() => 'Error'));

      component.saveValue();

      const orgUserDetails = {
        ...component.extendedOrgUser.ou,
        mobile: component.inputValue,
      };

      expect(component.validateInput).toHaveBeenCalledOnceWith();
      expect(orgUserService.postOrgUser).toHaveBeenCalledOnceWith(orgUserDetails);
      expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ action: 'ERROR' });
    });

    it('should not save mobile number if it is invalid', () => {
      component.error = 'Enter mobile number';

      component.saveValue();

      expect(component.validateInput).toHaveBeenCalledOnceWith();
      expect(orgUserService.postOrgUser).not.toHaveBeenCalled();
    });
  });
});
