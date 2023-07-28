import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { FyNumberComponent } from './fy-number.component';
import { FormsModule, ReactiveFormsModule, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { of } from 'rxjs';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatIconModule } from '@angular/material/icon';
import { DebugElement, Injector } from '@angular/core';
import { By } from '@angular/platform-browser';
import { getAllElementsBySelector, getElementBySelector, getElementByTagName } from 'src/app/core/dom-helpers';

describe('FyNumberComponent', () => {
  let component: FyNumberComponent;
  let fixture: ComponentFixture<FyNumberComponent>;
  let platform: jasmine.SpyObj<Platform>;
  let launchDarklyService: jasmine.SpyObj<LaunchDarklyService>;
  let inputEl: DebugElement;

  beforeEach(waitForAsync(() => {
    const platformSpy = jasmine.createSpyObj('Platform', ['is']);
    const launchDarklyServiceSpy = jasmine.createSpyObj('LaunchDarklyService', [
      'checkIfKeyboardPluginIsEnabled',
      'checkIfNegativeExpensePluginIsEnabled',
    ]);
    const injectorSpy = jasmine.createSpyObj('Injector', ['get']);

    TestBed.configureTestingModule({
      declarations: [FyNumberComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, FormsModule, ReactiveFormsModule],
      providers: [
        { provide: Platform, useValue: platformSpy },
        { provide: LaunchDarklyService, useValue: launchDarklyServiceSpy },
        {
          provide: Injector,
          useValue: injectorSpy,
        },
      ],
    }).compileComponents();

    platform = TestBed.inject(Platform) as jasmine.SpyObj<Platform>;
    launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;

    platform.is.withArgs('ios').and.returnValue(true);
    launchDarklyService.checkIfKeyboardPluginIsEnabled.and.returnValue(of(true));
    launchDarklyService.checkIfNegativeExpensePluginIsEnabled.and.returnValue(of(true));
    fixture = TestBed.createComponent(FyNumberComponent);
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.css('input'));
    fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the input value', () => {
    const value = '35.8';
    component.writeValue(value);
    expect(component.value).toEqual(35.8);
    expect(component.innerValue).toEqual(35.8);
  });

  it('onBlur(): should call onTouchedCallback', () => {
    spyOn(component, 'onTouchedCallback');
    const callbackFunc = jasmine.createSpy('callback');
    component.registerOnTouched(callbackFunc);

    component.onBlur();
    expect(callbackFunc).toHaveBeenCalledTimes(1);
    expect(component.onTouchedCallback).toHaveBeenCalledTimes(1);
  });

  it('should enable the input when setDisabledState is called with false', () => {
    component.setDisabledState(false);
    fixture.detectChanges();
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputElement.disabled).toBe(false);
  });

  describe('onInit(): valueChanges subscription and check if values are being set correctly', () => {
    it('should not enable the keyboard plugin when checkIfKeyboardPluginIsEnabled returns false', () => {
      spyOn(component, 'handleChange');

      platform.is.withArgs('ios').and.returnValue(false);
      launchDarklyService.checkIfKeyboardPluginIsEnabled.and.returnValue(of(false));

      component.ngOnInit();
      fixture.detectChanges();
      const inputElement = fixture.debugElement.queryAll(By.css('.fy-number--input'));
      expect(component.isIos).toBe(false);
      expect(component.isKeyboardPluginEnabled).toBeFalse();
      expect(inputElement.length).toBe(1);
      expect(component.handleChange).not.toHaveBeenCalled();
    });

    it('should not enable the negative expense plugin when checkIfKeyboardPluginIsEnabled returns false', () => {
      spyOn(component, 'handleChange');

      platform.is.withArgs('ios').and.returnValue(false);
      launchDarklyService.checkIfNegativeExpensePluginIsEnabled.and.returnValue(of(false));

      component.ngOnInit();
      fixture.detectChanges();
      const inputElement = fixture.debugElement.queryAll(By.css('.fy-number--input'));
      expect(component.isIos).toBe(false);
      expect(component.isNegativeExpensePluginEnabled).toBeFalse();
      expect(inputElement.length).toBe(1);
      expect(component.handleChange).not.toHaveBeenCalled();
    });

    it('should set this.value to a parsed float when given a string', () => {
      spyOn(component, 'onChangeCallback').and.callThrough();
      const mockCallback = jasmine.createSpy('mockCallback');

      component.registerOnChange(mockCallback);
      component.fc.setValue('1.5');
      expect(component.value).toBe(1.5);
      expect(component.innerValue).toBe(1.5);
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(component.onChangeCallback).toHaveBeenCalledOnceWith(1.5);
    });

    it('should set this.value to a number when given a number', () => {
      spyOn(component, 'onChangeCallback').and.callThrough();
      const mockCallback = jasmine.createSpy('mockCallback');

      component.registerOnChange(mockCallback);
      component.fc.setValue(2.5);
      expect(component.value).toBe(2.5);
      expect(component.innerValue).toBe(2.5);
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(component.onChangeCallback).toHaveBeenCalledOnceWith(2.5);
    });

    it('should set this.value to null when given an invalid value', () => {
      spyOn(component, 'onChangeCallback').and.callThrough();
      const mockCallback = jasmine.createSpy('mockCallback');

      component.registerOnChange(mockCallback);
      component.fc.setValue(null);
      expect(component.value).toBeNull();
      expect(component.innerValue).toBeNull();
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(component.onChangeCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleChanges():', () => {
    it('should patch value with period as decimal separator if the last input was a comma or else keep it as it is', () => {
      spyOn(component.fc, 'setValue').and.callThrough();
      spyOn(component.fc, 'patchValue').and.callThrough();

      component.handleChange({ target: { value: '12' }, code: 'Digit1' } as any);
      expect(component.commaClicked).toBeFalse();
      expect(component.fc.patchValue).not.toHaveBeenCalled();
      expect(component.inputWithoutDecimal).toBe('12');

      component.handleChange({ target: { value: '12,' }, code: 'Comma' } as any);
      expect(component.commaClicked).toBeTrue();
      expect(component.fc.patchValue).not.toHaveBeenCalled();
      expect(component.inputWithoutDecimal).toBe('12');

      //target value will the appended with a period
      component.handleChange({ target: { value: '12.5' }, code: 'Digit5', key: '5' } as any);
      expect(component.commaClicked).toBeFalse();
      expect(component.fc.patchValue).toHaveBeenCalledOnceWith('12.5');
      expect(component.value).toBe(12.5);
      expect(component.inputWithoutDecimal).toBe('12.5');

      const inputWithoutPlugin = fixture.debugElement.query(By.css('#inputWithoutPlugin input'));
      expect(inputWithoutPlugin).toBeNull();

      const inputElement = fixture.debugElement.queryAll(By.css('.fy-number--input'));
      expect(inputElement.length).toBe(1);

      expect(component.isIos).toBeTrue();
      expect(component.isKeyboardPluginEnabled).toBeTrue();
    });

    it('should replace comma with period as decimal separator when input is comma-separated', () => {
      spyOn(component.fc, 'setValue').and.callThrough();
      spyOn(component.fc, 'patchValue').and.callThrough();

      component.handleChange({ target: { value: '32' }, code: 'Digit3' } as any);
      expect(component.commaClicked).toBeFalse();
      expect(component.fc.patchValue).not.toHaveBeenCalled();
      expect(component.inputWithoutDecimal).toBe('32');

      component.handleChange({ target: { value: '32,' }, code: 'Comma' } as any);
      expect(component.commaClicked).toBeTrue();
      expect(component.fc.patchValue).not.toHaveBeenCalled();
      expect(component.inputWithoutDecimal).toBe('32');

      component.handleChange({ target: { value: '32.4533' }, code: 'Digit5', key: '4533' } as any);
      expect(component.commaClicked).toBeFalse();
      expect(component.fc.patchValue).toHaveBeenCalledOnceWith('32.4533');
      expect(component.value).toBe(32.4533);
      expect(component.inputWithoutDecimal).toBe('32.4533');

      expect(component.isIos).toBeTrue();
      expect(component.isKeyboardPluginEnabled).toBeTrue();

      const inputWithoutPlugin = fixture.debugElement.query(By.css('#inputWithoutPlugin input'));
      expect(inputWithoutPlugin).toBeNull();

      const inputElement = fixture.debugElement.queryAll(By.css('.fy-number--input'));
      expect(inputElement.length).toBe(1);
    });

    it('should handle zero input correctly', () => {
      spyOn(component.fc, 'setValue').and.callThrough();
      spyOn(component.fc, 'patchValue').and.callThrough();
      component.handleChange({ target: { value: '0' }, code: 'Digit0' } as any);

      expect(component.commaClicked).toBeFalse();
      expect(component.inputWithoutDecimal).toBe('0');
      expect(component.fc.patchValue).not.toHaveBeenCalled();
      expect(component.isIos).toBeTrue();
      expect(component.isKeyboardPluginEnabled).toBeTrue();

      const inputWithoutPlugin = fixture.debugElement.query(By.css('#inputWithoutPlugin input'));
      expect(inputWithoutPlugin).toBeNull();

      const inputElement = fixture.debugElement.queryAll(By.css('.fy-number--input'));
      expect(inputElement.length).toBe(1);
    });
  });

  it('should call handleChange only once on keyup', () => {
    spyOn(component, 'handleChange').and.callThrough();
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    inputElement.dispatchEvent(new KeyboardEvent('keyup', { key: '1' }));
    expect(component.handleChange).toHaveBeenCalledTimes(1);
  });

  describe('handleNegativeExpenseChange():', () => {
    it('should handle comma correctly if keyboard plugin and negative expense plugin are enabled and should not allow any non-numeric value', () => {
      const allInputElements = getAllElementsBySelector(fixture, '.fy-number--input') as HTMLInputElement[];

      let mockEvent = { target: { value: '-1' }, code: 'Digit2', key: '2', preventDefault: () => {} } as any;
      spyOn(mockEvent, 'preventDefault');
      component.handleNegativeExpenseChange(mockEvent);
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();

      mockEvent = { target: { value: '-12' }, code: 'KeyA', key: 'a', preventDefault: () => {} } as any;
      spyOn(mockEvent, 'preventDefault');
      component.handleNegativeExpenseChange(mockEvent);
      expect(mockEvent.preventDefault).toHaveBeenCalled();

      mockEvent = { target: { value: '-12' }, code: 'Comma', key: ',', preventDefault: () => {} } as any;
      spyOn(mockEvent, 'preventDefault');
      component.handleNegativeExpenseChange(mockEvent);
      expect(mockEvent.preventDefault).toHaveBeenCalled();

      mockEvent = { target: { value: '12.' }, code: 'Digit5', key: '5', preventDefault: () => {} } as any;
      spyOn(mockEvent, 'preventDefault');
      component.handleNegativeExpenseChange(mockEvent);
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();

      const inputWithPlugin = getElementBySelector(fixture, '#inputWithPlugin input');
      expect(inputWithPlugin).toBeNull();

      const inputWithoutPlugin = getElementBySelector(fixture, '#inputWithPlugin input');
      expect(inputWithoutPlugin).toBeNull();

      expect(allInputElements.length).toBe(1);

      expect(component.isIos).toBeTrue();
      expect(component.isKeyboardPluginEnabled).toBeTrue();
      expect(component.isNegativeExpensePluginEnabled).toBeTrue();
    });
  });
});
