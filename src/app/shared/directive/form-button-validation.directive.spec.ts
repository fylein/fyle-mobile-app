import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getElementRef } from 'src/app/core/dom-helpers';
import { FormButtonValidationDirective } from './form-button-validation.directive';
import { LoaderPosition } from './loader-position.enum';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  template: `<button appFormButtonValidation>Save</button>`,
})
class TestFormValidationButtonComponent {}

describe('FormButtonValidationDirective', () => {
  let component: TestFormValidationButtonComponent;
  let fixture: ComponentFixture<TestFormValidationButtonComponent>;
  let buttonElement: DebugElement;
  let directive: FormButtonValidationDirective;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    TestBed.configureTestingModule({
      declarations: [TestFormValidationButtonComponent, FormButtonValidationDirective],
      providers: [
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    });

    fixture = TestBed.createComponent(TestFormValidationButtonComponent);
    component = fixture.componentInstance;
    buttonElement = getElementRef(fixture, 'button') as DebugElement;
    directive = buttonElement.injector.get(FormButtonValidationDirective);
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;

    // Mock translate method to return expected strings
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'directives.formButtonValidation.saving': 'Saving',
        'directives.formButtonValidation.confirming': 'Confirming',
        'directives.formButtonValidation.updating': 'Updating',
        'directives.formButtonValidation.adding': 'Adding',
        'directives.formButtonValidation.deleting': 'Deleting',
        'directives.formButtonValidation.creating': 'Creating',
        'directives.formButtonValidation.approving': 'Approving',
        'directives.formButtonValidation.rejecting': 'Rejecting',
        'directives.formButtonValidation.pullingBack': 'Pulling Back',
        'directives.formButtonValidation.sendingBack': 'Sending Back',
        'directives.formButtonValidation.flagging': 'Flagging',
        'directives.formButtonValidation.verifying': 'Verifying',
        'directives.formButtonValidation.sharing': 'Sharing',
        'directives.formButtonValidation.sendingEmail': 'Sending Email',
        'directives.formButtonValidation.continuing': 'Continuing',
        'directives.formButtonValidation.settingExchangeRate': 'Setting Exchange Rate',
        'directives.formButtonValidation.signingIn': 'Signing In',
        'directives.formButtonValidation.signingUp': 'Signing Up',
        'directives.formButtonValidation.gettingStarted': 'Getting Started',
      };
      return translations[key] || key;
    });
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  describe('get selectedElement():', () => {
    it('should return the current html element', () => {
      const selectedElement = buttonElement.nativeElement;
      expect(directive.selectedElement).toEqual(selectedElement);
    });
  });

  it('ngOnChanges(): should start loading if any change is registered', () => {
    spyOn(directive, 'onLoading');

    directive.ngOnChanges();

    expect(directive.onLoading).toHaveBeenCalledOnceWith(directive.loading);
  });

  it('disableButton(): should disabled the button', () => {
    directive.disableButton();

    expect(directive.selectedElement.disabled).toBeTrue();
  });

  it('getButtonText(): should get button text', () => {
    directive.getButtonText();

    expect(directive.defaultText).toEqual('Save');
  });

  describe('changeLoadingText():', () => {
    it('should change the button text to loading text if provided', () => {
      directive.loadingText = 'Loading';

      directive.changeLoadingText();

      expect(directive.selectedElement.innerText).toEqual('Loading');
    });

    it('should change the button text to default text', () => {
      directive.defaultText = 'Default';

      directive.changeLoadingText();

      expect(directive.selectedElement.innerText).toEqual('Default');
    });

    it('should change the button text as defined in the text map using translation keys', () => {
      directive.defaultText = 'Save';
      directive.loadingTextKeyMap = {
        Save: 'directives.formButtonValidation.saving',
      };

      directive.changeLoadingText();

      expect(translocoService.translate).toHaveBeenCalledWith('directives.formButtonValidation.saving');
      expect(directive.selectedElement.innerText).toEqual('Saving');
    });
  });

  describe('addLoader():', () => {
    it('should add secondary loader', () => {
      directive.buttonType = 'secondary';

      directive.addLoader();

      expect(directive.selectedElement.classList.contains('disabled')).toBeTrue();
      expect(directive.selectedElement.innerText).toEqual('Save');
    });

    it('should add primary loader in prefix position', () => {
      directive.buttonType = 'primary';
      directive.loaderPosition = LoaderPosition.prefix;

      directive.addLoader();

      expect(directive.selectedElement.classList.contains('disabled')).toBeTrue();
      expect(directive.selectedElement.innerText).toEqual('Save');
    });
  });

  it('resetButton(): should reset button if the loader is added', () => {
    directive.loaderAdded = true;
    directive.defaultText = 'Save';

    directive.resetButton();

    expect(directive.selectedElement.classList.contains('disabled')).toBeFalse();
    expect(directive.selectedElement.disabled).toBeFalse();
    expect(directive.selectedElement.innerText).toEqual('Save');
  });

  describe('onLoading():', () => {
    it('should disable button if in loading state', () => {
      spyOn(directive, 'disableButton');
      spyOn(directive, 'getButtonText');
      spyOn(directive, 'changeLoadingText');
      spyOn(directive, 'addLoader');

      directive.onLoading(true);

      expect(directive.disableButton).toHaveBeenCalledTimes(1);
      expect(directive.getButtonText).toHaveBeenCalledTimes(1);
      expect(directive.changeLoadingText).toHaveBeenCalledTimes(1);
      expect(directive.addLoader).toHaveBeenCalledTimes(1);
    });

    it('should reset button if the button is not in loading state', () => {
      spyOn(directive, 'resetButton');

      directive.onLoading(false);

      expect(directive.resetButton).toHaveBeenCalledTimes(1);
    });
  });
});
