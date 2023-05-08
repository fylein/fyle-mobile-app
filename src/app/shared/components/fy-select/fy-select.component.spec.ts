import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { FySelectComponent } from './fy-select.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FySelectModalComponent } from './fy-select-modal/fy-select-modal.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('FySelectComponent', () => {
  let component: FySelectComponent;
  let fixture: ComponentFixture<FySelectComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalPropertiesService: jasmine.SpyObj<ModalPropertiesService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesServiceSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);

    TestBed.configureTestingModule({
      declarations: [FySelectComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: ModalPropertiesService,
          useValue: modalPropertiesServiceSpy,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FySelectComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalPropertiesService = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return validInParent value if touchedInParent is true and return true if touchedInParent is false', () => {
    component.touchedInParent = true;

    component.validInParent = false;
    expect(component.valid).toBe(false);

    component.validInParent = true;
    expect(component.valid).toBe(true);

    component.touchedInParent = false;
    // valid should return true in any case

    component.validInParent = true;
    expect(component.valid).toBe(true);

    component.validInParent = false;
    expect(component.valid).toBe(true);
  });

  it('value: should return innerValue', () => {
    component.innerValue = 'Economy';

    expect(component.value).toEqual('Economy');
  });

  describe('should set the value and update the displayValue', () => {
    beforeEach(() => {
      component.innerValue = 'ECONOMY';
      component.options = [
        { label: 'Business', value: 'BUSINESS' },
        { label: 'Economy', value: 'ECONOMY' },
        { label: '', value: '' },
      ];
      spyOn(component, 'onChangeCallback');
    });

    it('if any option.value is equal to innerValue', () => {
      component.value = 'BUSINESS';
      expect(component.innerValue).toEqual('BUSINESS');
      expect(component.displayValue).toEqual('Business');
      expect(component.onChangeCallback).toHaveBeenCalledOnceWith('BUSINESS');
    });

    it('if type of innerValue is string', () => {
      component.value = '';
      expect(component.innerValue).toEqual('');
      expect(component.displayValue).toEqual('');
      expect(component.onChangeCallback).toHaveBeenCalledOnceWith('');
    });
    it('if innerValue and defaultLabelProps is defined', () => {
      component.defaultLabelProp = 'vendor';
      component.value = { travelClass: 'BUSINESS', vendor: 'vendor1' };
      expect(component.innerValue).toEqual({ travelClass: 'BUSINESS', vendor: 'vendor1' });
      expect(component.displayValue).toEqual('vendor1');
      expect(component.onChangeCallback).toHaveBeenCalledOnceWith({ travelClass: 'BUSINESS', vendor: 'vendor1' });
    });
    it('if none of the conditions holds true', () => {
      component.defaultLabelProp = '';
      component.value = { travelClass: 'BUSINESS', vendor: 'vendor1' };
      expect(component.innerValue).toEqual({ travelClass: 'BUSINESS', vendor: 'vendor1' });
      expect(component.displayValue).toEqual('');
      expect(component.onChangeCallback).toHaveBeenCalledOnceWith({ travelClass: 'BUSINESS', vendor: 'vendor1' });
    });
  });

  describe('openModal(): should create a modal and set the value', () => {
    const mockDefaultProperties = {
      cssClass: 'fy-modal',
      showBackdrop: true,
      canDismiss: true,
      backdropDismiss: true,
      animated: true,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: false,
    };

    it('if label is Payment Mode', fakeAsync(() => {
      spyOn(component, 'onChangeCallback').and.callThrough();
      const mockCallback = jasmine.createSpy('mockCallback');
      component.value = 'PreviousValue';
      component.registerOnChange(mockCallback);
      component.label = 'Payment Mode';
      const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onWillDismiss']);
      modalController.create.and.returnValue(Promise.resolve(modalSpy));
      modalSpy.onWillDismiss.and.returnValue(Promise.resolve({ data: { value: 'UpdatedValue' } }));

      modalPropertiesService.getModalDefaultProperties.and.returnValue(mockDefaultProperties);
      const {
        options,
        value,
        selectionElement,
        nullOption,
        cacheName,
        customInput,
        subheader,
        enableSearch,
        selectModalHeader,
        placeholder,
        showSaveButton,
        defaultLabelProp,
        recentlyUsed,
        label,
      } = component;
      const mockInput = fixture.debugElement.query(By.css('input'));
      mockInput.nativeElement.click();
      tick(1000);
      fixture.detectChanges();
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: FySelectModalComponent,
        componentProps: {
          options,
          currentSelection: value,
          selectionElement,
          nullOption,
          cacheName,
          customInput,
          subheader,
          enableSearch,
          selectModalHeader: selectModalHeader || 'Select Item',
          placeholder,
          showSaveButton,
          defaultLabelProp,
          recentlyUsed,
          label,
        },
        mode: 'ios',
        ...mockDefaultProperties,
      });
      expect(modalPropertiesService.getModalDefaultProperties).toHaveBeenCalledOnceWith('payment-mode-modal');
      expect(modalSpy.present).toHaveBeenCalledTimes(1);
      expect(modalSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(component.onChangeCallback).toHaveBeenCalledOnceWith('UpdatedValue');
      expect(component.value).toEqual('UpdatedValue');
    }));

    it('if label is not equal to Payment Mode', fakeAsync(() => {
      spyOn(component, 'onChangeCallback').and.callThrough();
      const mockCallback = jasmine.createSpy('mockCallback');
      component.value = 'PreviousValue';
      component.registerOnChange(mockCallback);
      component.label = 'Travel Class';
      const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onWillDismiss']);
      modalController.create.and.returnValue(Promise.resolve(modalSpy));
      modalSpy.onWillDismiss.and.returnValue(Promise.resolve({ data: { value: 'UpdatedValue' } }));

      modalPropertiesService.getModalDefaultProperties.and.returnValue(mockDefaultProperties);
      const {
        options,
        value,
        selectionElement,
        nullOption,
        cacheName,
        customInput,
        subheader,
        enableSearch,
        selectModalHeader,
        placeholder,
        showSaveButton,
        defaultLabelProp,
        recentlyUsed,
        label,
      } = component;
      const mockInput = fixture.debugElement.query(By.css('input'));
      mockInput.nativeElement.click();
      tick(1000);
      fixture.detectChanges();
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: FySelectModalComponent,
        componentProps: {
          options,
          currentSelection: value,
          selectionElement,
          nullOption,
          cacheName,
          customInput,
          subheader,
          enableSearch,
          selectModalHeader: selectModalHeader || 'Select Item',
          placeholder,
          showSaveButton,
          defaultLabelProp,
          recentlyUsed,
          label,
        },
        mode: 'ios',
        ...mockDefaultProperties,
      });
      expect(modalPropertiesService.getModalDefaultProperties).toHaveBeenCalledOnceWith('fy-modal');
      expect(modalSpy.present).toHaveBeenCalledTimes(1);
      expect(modalSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(component.onChangeCallback).toHaveBeenCalledOnceWith('UpdatedValue');
      expect(component.value).toEqual('UpdatedValue');
    }));
  });

  it('onBlur(): should call onTouchedCallback', () => {
    spyOn(component, 'onTouchedCallback');
    const callbackFunc = jasmine.createSpy('callback');
    component.registerOnTouched(callbackFunc);
    const mockInput = fixture.debugElement.query(By.css('input'));
    mockInput.nativeElement.dispatchEvent(new InputEvent('blur'));
    fixture.detectChanges();
    expect(callbackFunc).toHaveBeenCalledTimes(1);
    expect(component.onTouchedCallback).toHaveBeenCalledTimes(1);
  });

  describe('writeValue(): should set the value and update the displayValue', () => {
    beforeEach(() => {
      component.innerValue = 'ECONOMY';
      component.options = [
        { label: 'Business', value: 'BUSINESS' },
        { label: 'Economy', value: 'ECONOMY' },
        { label: '', value: '' },
      ];
    });

    it('if any option.value is equal to innerValue', () => {
      component.writeValue('BUSINESS');
      expect(component.innerValue).toEqual('BUSINESS');
      expect(component.displayValue).toEqual('Business');
    });

    it('if type of innerValue is string', () => {
      component.writeValue('');
      expect(component.innerValue).toEqual('');
      expect(component.displayValue).toEqual('');
    });
    it('if innerValue and defaultLabelProps is defined', () => {
      component.defaultLabelProp = 'vendor';
      component.writeValue({ travelClass: 'BUSINESS', vendor: 'vendor1' });
      expect(component.innerValue).toEqual({ travelClass: 'BUSINESS', vendor: 'vendor1' });
      expect(component.displayValue).toEqual('vendor1');
    });
    it('if none of the conditions holds true', () => {
      component.defaultLabelProp = '';
      component.writeValue({ travelClass: 'BUSINESS', vendor: 'vendor1' });
      expect(component.innerValue).toEqual({ travelClass: 'BUSINESS', vendor: 'vendor1' });
      expect(component.displayValue).toEqual('');
    });
  });

  // it('registerOnChange(): should set onChangeCallback function', () => {
  //   spyOn(component, 'onChangeCallback').and.callThrough();
  //   const mockCallback = jasmine.createSpy('mockCallback');
  //   component.registerOnChange(mockCallback);
  //   expect(component.onChangeCallback).toEqual(mockCallback);
  // });

  // it('registerOnTouched(): should set onTouchedCallback function', () => {
  //   const mockCallback = jasmine.createSpy('mockCallback', () => {});
  //   component.registerOnTouched(mockCallback);
  //   expect(component.onTouchedCallback).toEqual(mockCallback);
  // });
});
