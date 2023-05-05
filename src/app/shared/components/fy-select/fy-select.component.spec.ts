import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { FySelectComponent } from './fy-select.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FySelectModalComponent } from './fy-select-modal/fy-select-modal.component';

fdescribe('FySelectComponent', () => {
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

  it('should set the value and update the displayValue', () => {
    component.innerValue = 'ECONOMY';
    component.options = [
      { label: 'Business', value: 'BUSINESS' },
      { label: 'Economy', value: 'ECONOMY' },
      { label: '', value: '' },
    ];
    spyOn(component, 'onChangeCallback');

    component.value = 'BUSINESS';

    expect(component.innerValue).toEqual('BUSINESS');
    expect(component.displayValue).toEqual('Business');
    expect(component.onChangeCallback).toHaveBeenCalledWith('BUSINESS');

    // Checking second if condition
    component.value = '';
    expect(component.innerValue).toEqual('');
    expect(component.displayValue).toEqual('');
    expect(component.onChangeCallback).toHaveBeenCalledWith('');

    // Checking third if condition
    component.defaultLabelProp = 'vendor';
    component.value = { travelClass: 'BUSINESS', vendor: 'vendor1' };
    expect(component.innerValue).toEqual({ travelClass: 'BUSINESS', vendor: 'vendor1' });
    expect(component.displayValue).toEqual('vendor1');
    expect(component.onChangeCallback).toHaveBeenCalledWith({ travelClass: 'BUSINESS', vendor: 'vendor1' });

    // Checking last if condition
    component.defaultLabelProp = '';
    component.value = { travelClass: 'BUSINESS', vendor: 'vendor1' };
    expect(component.innerValue).toEqual({ travelClass: 'BUSINESS', vendor: 'vendor1' });
    expect(component.displayValue).toEqual('');
    expect(component.onChangeCallback).toHaveBeenCalledWith({ travelClass: 'BUSINESS', vendor: 'vendor1' });
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
      component.label = 'Payment Mode';
      component.value = 'PreviousValue';

      const dataPromise = new Promise((resolve) => {
        setTimeout(() => resolve({ data: { value: 'UpdatedValue' } }), 2000); // test was updating the component.value instantaneously, therefore a delay was required;
      });
      modalController.create.and.returnValue(
        Promise.resolve({
          present: () => {},
          onWillDismiss: () => dataPromise,
        } as any)
      );

      modalPropertiesService.getModalDefaultProperties.and.returnValue(mockDefaultProperties);

      component.openModal();
      tick(1000);
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: FySelectModalComponent,
        componentProps: {
          options: component.options,
          currentSelection: component.value,
          selectionElement: component.selectionElement,
          nullOption: component.nullOption,
          cacheName: component.cacheName,
          customInput: component.customInput,
          subheader: component.subheader,
          enableSearch: component.enableSearch,
          selectModalHeader: component.selectModalHeader || 'Select Item',
          placeholder: component.placeholder,
          showSaveButton: component.showSaveButton,
          defaultLabelProp: component.defaultLabelProp,
          recentlyUsed: component.recentlyUsed,
          label: component.label,
        },
        mode: 'ios',
        ...mockDefaultProperties,
      });
      expect(modalPropertiesService.getModalDefaultProperties).toHaveBeenCalledOnceWith('payment-mode-modal');

      tick(1000);
      expect(component.value).toEqual('UpdatedValue');
    }));

    it('if label is not equal to Payment Mode', fakeAsync(() => {
      component.label = 'Travel Class';
      component.value = 'PreviousValue';

      const dataPromise = new Promise((resolve) => {
        setTimeout(() => resolve({ data: { value: 'UpdatedValue' } }), 2000); // test was updating the component.value instantaneously, therefore a delay was required;
      });
      modalController.create.and.returnValue(
        Promise.resolve({
          present: () => {},
          onWillDismiss: () => dataPromise,
        } as any)
      );

      modalPropertiesService.getModalDefaultProperties.and.returnValue(mockDefaultProperties);

      component.openModal();
      tick(1000);
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: FySelectModalComponent,
        componentProps: {
          options: component.options,
          currentSelection: component.value,
          selectionElement: component.selectionElement,
          nullOption: component.nullOption,
          cacheName: component.cacheName,
          customInput: component.customInput,
          subheader: component.subheader,
          enableSearch: component.enableSearch,
          selectModalHeader: component.selectModalHeader || 'Select Item',
          placeholder: component.placeholder,
          showSaveButton: component.showSaveButton,
          defaultLabelProp: component.defaultLabelProp,
          recentlyUsed: component.recentlyUsed,
          label: component.label,
        },
        mode: 'ios',
        ...mockDefaultProperties,
      });
      expect(modalPropertiesService.getModalDefaultProperties).toHaveBeenCalledOnceWith('fy-modal');

      tick(1000);
      expect(component.value).toEqual('UpdatedValue');
    }));
  });

  it('onBlur(): should call onTouchedCallback', () => {
    spyOn(component, 'onTouchedCallback');
    component.onBlur();
    expect(component.onTouchedCallback).toHaveBeenCalledTimes(1);
  });

  it('writeValue(): should set the value and update the displayValue', () => {
    component.innerValue = 'ECONOMY';
    component.options = [
      { label: 'Business', value: 'BUSINESS' },
      { label: 'Economy', value: 'ECONOMY' },
      { label: '', value: '' },
    ];
    spyOn(component, 'onChangeCallback');

    component.writeValue('BUSINESS');

    expect(component.innerValue).toEqual('BUSINESS');
    expect(component.displayValue).toEqual('Business');

    // Checking second if condition
    component.writeValue('');
    expect(component.innerValue).toEqual('');
    expect(component.displayValue).toEqual('');

    // Checking third if condition
    component.defaultLabelProp = 'vendor';
    component.writeValue({ travelClass: 'BUSINESS', vendor: 'vendor1' });
    expect(component.innerValue).toEqual({ travelClass: 'BUSINESS', vendor: 'vendor1' });
    expect(component.displayValue).toEqual('vendor1');

    // Checking last if condition
    component.defaultLabelProp = '';
    component.writeValue({ travelClass: 'BUSINESS', vendor: 'vendor1' });
    expect(component.innerValue).toEqual({ travelClass: 'BUSINESS', vendor: 'vendor1' });
    expect(component.displayValue).toEqual('');
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
});
