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

describe('FyNumberComponent', () => {
  let component: FyNumberComponent;
  let fixture: ComponentFixture<FyNumberComponent>;
  let platform: jasmine.SpyObj<Platform>;
  let launchDarklyService: jasmine.SpyObj<LaunchDarklyService>;
  let inputEl: DebugElement;

  beforeEach(waitForAsync(() => {
    const platformSpy = jasmine.createSpyObj('Platform', ['is']);
    const launchDarklyServiceSpy = jasmine.createSpyObj('LaunchDarklyService', ['checkIfKeyboardPluginIsEnabled']);
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
    const value = 35.8;
    component.writeValue(value);
    expect(component.value).toEqual(value);
    expect(component.innerValue).toEqual(value);
  });

  it('registerOnChange(): should set onChangeCallback function', () => {
    const mockCallback = () => {};
    component.registerOnChange(mockCallback);
    expect(component.onChangeCallback).toEqual(mockCallback);
  });

  it('registerOnTouched(): should set onTouchedCallback function', () => {
    const mockCallback = () => {};
    component.registerOnTouched(mockCallback);
    expect(component.onTouchedCallback).toEqual(mockCallback);
  });

  it('onBlur(): should call onTouchedCallback', () => {
    spyOn(component, 'onTouchedCallback');
    component.onBlur();
    expect(component.onTouchedCallback).toHaveBeenCalledTimes(1);
  });

  it('should enable the input when setDisabledState is called with false', () => {
    component.setDisabledState(false);
    fixture.detectChanges();
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputElement.disabled).toBe(false);
  });

  describe('onInit(): valueChanges subscription', () => {
    it('should not enable the keyboard plugin when checkIfKeyboardPluginIsEnabled returns false', fakeAsync(() => {
      platform.is.withArgs('ios').and.returnValue(false);
      launchDarklyService.checkIfKeyboardPluginIsEnabled.and.returnValue(of(false));
      component.ngOnInit();
      fixture.detectChanges();
      tick(500);
      expect(component.isIos).toBe(false);
      expect(component.isKeyboardPluginEnabled).toBeFalse();
    }));

    it('should set this.value to a parsed float when given a string', () => {
      component.fc.setValue('1.5');
      expect(component.value).toBe(1.5);
    });

    it('should set this.value to a number when given a number', () => {
      component.fc.setValue(2.5);
      expect(component.value).toBe(2.5);
    });

    it('should set this.value to null when given an invalid value', () => {
      component.fc.setValue(null);
      expect(component.value).toBeNull();
    });
  });

  describe('handleChanges():', () => {
    it('should patch value with period as decimal separator if the last input was a comma or else keep it as it is', () => {
      component.handleChange({ target: { value: '12' }, code: 'Digit1' } as any);
      component.fc.setValue(12);
      expect(component.fc.value).toBe(12);
      expect(component.commaClicked).toBeFalse();
      expect(component.inputWithoutDecimal).toBe('12');

      component.handleChange({ target: { value: '12,' }, code: 'Comma' } as any);
      expect(component.commaClicked).toBeTrue();
      expect(component.inputWithoutDecimal).toBe('12');
      //target value will the appended with a period
      component.handleChange({ target: { value: '12.5' }, code: 'Digit5' } as any);
      expect(component.commaClicked).toBeFalse();
      expect(component.inputWithoutDecimal).toBe('12.5');
      component.fc.setValue(12.5);
      expect(component.fc.value).toBe(12.5);

      const inputWithoutPlugin = fixture.debugElement.query(By.css('#inputWithoutPlugin'));
      expect(inputWithoutPlugin).toBeFalsy();

      expect(component.isIos).toBeTrue();
      expect(component.isKeyboardPluginEnabled).toBeTrue();
    });

    it('should replace comma with period as decimal separator when input is comma-separated', () => {
      component.handleChange({ target: { value: '32' }, code: 'Digit3' } as any);
      component.fc.setValue(32);
      expect(component.fc.value).toBe(32);
      expect(component.commaClicked).toBeFalse();
      expect(component.inputWithoutDecimal).toBe('32');

      component.handleChange({ target: { value: '32,' }, code: 'Comma' } as any);
      expect(component.commaClicked).toBeTrue();
      expect(component.inputWithoutDecimal).toBe('32');

      component.handleChange({ target: { value: '32.4533' }, code: 'Digit5' } as any);
      expect(component.commaClicked).toBeFalse();
      expect(component.inputWithoutDecimal).toBe('32.4533');
      component.fc.setValue(32.4533);
      expect(component.fc.value).toBe(32.4533);
      expect(component.isIos).toBeTrue();
      expect(component.isKeyboardPluginEnabled).toBeTrue();

      const inputWithoutPlugin = fixture.debugElement.query(By.css('#inputWithoutPlugin'));
      expect(inputWithoutPlugin).toBeFalsy();
    });

    it('should handle zero input correctly', () => {
      component.handleChange({ target: { value: '0' }, code: 'Digit0' } as any);
      component.fc.setValue(0);
      expect(component.fc.value).toBe(0);
      expect(component.commaClicked).toBeFalse();
      expect(component.inputWithoutDecimal).toBe('0');
      expect(component.isIos).toBeTrue();
      expect(component.isKeyboardPluginEnabled).toBeTrue();

      const inputWithoutPlugin = fixture.debugElement.query(By.css('#inputWithoutPlugin'));
      expect(inputWithoutPlugin).toBeFalsy();
    });
  });
});
