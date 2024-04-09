import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getElementRef } from 'src/app/core/dom-helpers';
import { FormButtonValidationDirective } from './form-button-validation.directive';
import { LoaderPosition } from './loader-position.enum';

@Component({
  template: `<button appFormButtonValidation>Save</button>`,
})
class TestFormValidationButtonComponent {}

describe('FormButtonValidationDirective', () => {
  let component: TestFormValidationButtonComponent;
  let fixture: ComponentFixture<TestFormValidationButtonComponent>;
  let buttonElement: DebugElement;
  let directive: FormButtonValidationDirective;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestFormValidationButtonComponent, FormButtonValidationDirective],
    });

    fixture = TestBed.createComponent(TestFormValidationButtonComponent);
    component = fixture.componentInstance;
    buttonElement = getElementRef(fixture, 'button') as DebugElement;
    directive = buttonElement.injector.get(FormButtonValidationDirective);
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

    it('should change the button text as defined in the text map', () => {
      directive.defaultText = 'Directive';
      directive.loadingTextMap = {
        Directive: 'Loading Text',
      };

      directive.changeLoadingText();

      expect(directive.selectedElement.innerText).toEqual('Loading Text');
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
