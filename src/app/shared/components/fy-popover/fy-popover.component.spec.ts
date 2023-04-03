import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { FyPopoverComponent } from './fy-popover.component';

describe('FyPopoverComponent', () => {
  let component: FyPopoverComponent;
  let fixture: ComponentFixture<FyPopoverComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let simpleFormInput: DebugElement;

  beforeEach(async () => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    await TestBed.configureTestingModule({
      declarations: [FyPopoverComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, FormsModule],
      providers: [{ provide: PopoverController, useValue: popoverControllerSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FyPopoverComponent);
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    simpleFormInput = fixture.debugElement.nativeElement.querySelector('textarea');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('dismiss(): should dismiss the popover', () => {
    popoverController.dismiss.and.returnValue(Promise.resolve(true));
    component.dismiss();
    expect(popoverController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('submit(): should submit the form', () => {
    popoverController.dismiss.and.returnValue(Promise.resolve(true));
    component.formValue = 'Test comment';
    component.submit();
    expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ comment: 'Test comment' });
  });

  it('should disable the submit button when form value is empty', () => {
    const submitButton = getElementBySelector(fixture, '.fy-popover--toolbar__btn') as HTMLButtonElement;
    component.formValue = '';
    fixture.detectChanges();
    expect(submitButton.disabled).toBeTrue();
  });

  it('should enable the submit button when form value is not empty', () => {
    const submitButton = getElementBySelector(fixture, '.fy-popover--toolbar__btn') as HTMLButtonElement;
    component.formValue = 'Test comment';
    fixture.detectChanges();
    expect(submitButton.disabled).toBeFalse();
  });
});
