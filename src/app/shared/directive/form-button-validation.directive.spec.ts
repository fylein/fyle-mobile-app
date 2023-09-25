import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormButtonValidationDirective } from './form-button-validation.directive';
import { FormatDateDirective } from './format-date.directive';
import { By } from '@angular/platform-browser';

@Component({
  template: `<button appFormButtonValidation>Save</button>`,
})
class TestFormValidationButtonComponent {}

fdescribe('FormButtonValidationDirective', () => {
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
    buttonElement = fixture.debugElement.query(By.css('button'));
    directive = buttonElement.injector.get(FormButtonValidationDirective);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('get selectedElement(): should return the current html element', () => {
    const selectedElement = buttonElement.nativeElement;
    expect(directive.selectedElement).toEqual(selectedElement);
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
});
