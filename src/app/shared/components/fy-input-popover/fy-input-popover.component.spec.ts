import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { click, getElementBySelector, getElementRef, getTextContent } from 'src/app/core/dom-helpers';
import { FyInputPopoverComponent } from './fy-input-popover.component';

describe('FyInputPopoverComponent', () => {
  let component: FyInputPopoverComponent;
  let fixture: ComponentFixture<FyInputPopoverComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;

  beforeEach(async () => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, FormsModule],
      declarations: [FyInputPopoverComponent],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    fixture = TestBed.createComponent(FyInputPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('closePopover(): should close popover', fakeAsync(() => {
    popoverController.dismiss.and.returnValue(Promise.resolve(true));

    tick();
    component.closePopover();
    expect(popoverController.dismiss).toHaveBeenCalledTimes(1);
  }));

  describe('saveValue():', () => {
    beforeEach(() => {
      popoverController.dismiss.and.resolveTo(true);
      component.inputValue = 'input';
    });

    it('should save input value', fakeAsync(() => {
      fixture.detectChanges();

      component.saveValue();
      expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ newValue: component.inputValue });
    }));

    it('should not save the input value and close the popover if the input value is invalid', () => {
      component.error = 'Please enter a valid mobile number';
      fixture.detectChanges();

      component.saveValue();
      expect(popoverController.dismiss).not.toHaveBeenCalled();
    });
  });

  it('should display title', () => {
    component.title = 'Title';
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.input-popover--toolbar__title'))).toEqual('Title');
  });

  it('should display CTA text and save value when clicked', () => {
    spyOn(component, 'saveValue').and.callThrough();
    component.ctaText = 'CTA text';
    component.isRequired = true;
    component.inputValue = 'value';
    fixture.detectChanges();

    const ctaButton = getElementBySelector(fixture, '.input-popover--toolbar__btn') as HTMLElement;
    expect(getTextContent(ctaButton)).toEqual('CTA text');
    click(ctaButton);
    expect(component.saveValue).toHaveBeenCalledTimes(1);
  });

  it('should display input label and mandatory symbol', () => {
    component.inputLabel = 'Label';
    component.isRequired = true;
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.input-popover--input-container__label'))).toEqual('Label  *');
    expect(getTextContent(getElementBySelector(fixture, '.input-popover--input-container__mandatory'))).toEqual('*');
  });

  it('onFocus(): should set error to null', () => {
    component.error = 'Please enter valid mobile number';
    fixture.detectChanges();

    component.onFocus();
    expect(component.error).toEqual(null);
  });

  it('ngAfterViewInit(): should focus on input element', fakeAsync(() => {
    const inputEl = getElementRef(fixture, 'input');
    spyOn(inputEl.nativeElement, 'focus');
    component.ngAfterViewInit();

    tick(400);
    expect(inputEl.nativeElement.focus).toHaveBeenCalledTimes(1);
  }));

  describe('validateInput():', () => {
    beforeEach(() => {
      component.isRequired = true;
    });

    it('should not change error if input value is not empty', () => {
      component.error = null;
      component.inputValue = 'value';
      fixture.detectChanges();

      component.validateInput();
      expect(component.error).toBeNull();
    });

    it('should set error if input value is empty and other than tel', () => {
      component.error = null;
      component.inputLabel = 'Report Name';
      component.inputValue = '';
      fixture.detectChanges();

      component.validateInput();
      expect(component.error).toEqual('Please enter a Report Name');
    });

    it('should set error if input value is empty and type is tel but value is not valid', () => {
      component.error = null;
      component.inputLabel = 'Mobile Number';
      component.inputValue = '9534';
      component.inputType = 'tel';
      fixture.detectChanges();

      component.validateInput();
      expect(component.error).toEqual('Please enter a valid mobile number with country code. e.g. +12025559975');
    });
  });
});
