import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { FyNumberComponent } from './fy-number.component';
import { FormArray, FormBuilder, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
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

  describe('valueChanges subscription', () => {
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

  describe('handleChange():', () => {
    it('should set commaClicked to true when the Comma key is pressed', () => {
      fixture.detectChanges();
      const inputElement = fixture.debugElement.query(By.css('.fy-number--input')).nativeElement;

      const event = new KeyboardEvent('keyup', {
        code: 'Comma',
        key: ',',
      });

      spyOnProperty(event, 'target').and.returnValue(inputElement);
      spyOn(inputElement, 'value').and.returnValue('1');
      component.commaClicked = false;

      component.handleChange(event);

      expect(component.commaClicked).toBe(true);
    });

    it('should patch value with period as decimal separator if the last input was a comma', () => {
      fixture.detectChanges();
      const inputElement = fixture.debugElement.query(By.css('.fy-number--input')).nativeElement;

      const event = new KeyboardEvent('keyup', {
        code: 'Digit2',
        key: '2',
      });

      spyOnProperty(event, 'target').and.returnValue(inputElement);
      spyOn(inputElement, 'value').and.returnValue('1');
      component.commaClicked = true;
      spyOn(component.fc, 'patchValue');

      component.handleChange(event);

      expect(component.commaClicked).toBe(false);
      expect(component.inputWithoutDecimal).toBe('');
    });
  });
});
