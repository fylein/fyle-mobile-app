import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule, ModalController } from '@ionic/angular';

import { Injector, NO_ERRORS_SCHEMA } from '@angular/core';
import { VirtualSelectComponent } from './virtual-select.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { UntypedFormControl, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { properties } from 'src/app/core/mock-data/modal-properties.data';
import { virtualSelectModalControllerParams } from 'src/app/core/mock-data/modal-controller.data';
import { of } from 'rxjs';

describe('VirtualSelectModalComponent', () => {
  let component: VirtualSelectComponent;
  let fixture: ComponentFixture<VirtualSelectComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesServiceSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const injectorSpy = jasmine.createSpyObj('Injector', ['get']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), TranslocoModule, VirtualSelectComponent],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: ModalPropertiesService,
          useValue: modalPropertiesServiceSpy,
        },
        {
          provide: Injector,
          useValue: injectorSpy,
        },
        {
          provide: NgControl,
          useValue: {
            control: new UntypedFormControl(),
          },
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(VirtualSelectComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'virtualSelect.selectItemHeader': 'Select item',
        'virtualSelect.subheader': 'All',
        'virtualSelect.paymentModeLabel': 'Payment mode',
        'virtualSelect.placeholder': 'Select {{label}}',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{${key}}`, params[key]);
        });
      }
      return translation;
    });
    component.enableSearch = true;
    fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('openModal():', () => {
    let selectionModalSpy: jasmine.SpyObj<HTMLIonModalElement>;
    beforeEach(() => {
      selectionModalSpy = jasmine.createSpyObj('selectionModal', ['present', 'onWillDismiss']);
      selectionModalSpy.onWillDismiss.and.resolveTo({
        data: {
          value: 'value',
        },
      });
      modalProperties.getModalDefaultProperties.and.returnValue(properties);
      modalController.create.and.resolveTo(selectionModalSpy);
    });

    it('should open select modal and set value equals to value returned by modal', fakeAsync(() => {
      // Explicitly set subheader to match the expected mock data
      component.subheader = 'All';
      component.openModal();
      tick(100);

      expect(modalController.create).toHaveBeenCalledOnceWith(virtualSelectModalControllerParams);
      expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledOnceWith('virtual-modal');
      expect(selectionModalSpy.present).toHaveBeenCalledTimes(1);
      expect(selectionModalSpy.onWillDismiss).toHaveBeenCalledTimes(1);
    }));

    it('should open select modal and set value equals to value returned by modal if label is Payment Mode', fakeAsync(() => {
      component.label = 'Payment mode';
      // Explicitly set subheader to match the expected mock data
      component.subheader = 'All';
      component.openModal();
      tick(100);

      expect(modalController.create).toHaveBeenCalledOnceWith({
        ...virtualSelectModalControllerParams,
        componentProps: { ...virtualSelectModalControllerParams.componentProps, label: 'Payment mode' },
      });
      expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledOnceWith('payment-mode-modal');
      expect(selectionModalSpy.present).toHaveBeenCalledTimes(1);
      expect(selectionModalSpy.onWillDismiss).toHaveBeenCalledTimes(1);
    }));
  });

  describe('get valid():', () => {
    beforeEach(() => {
      //@ts-ignore
      component.ngControl.touched = true;
      //@ts-ignore
      component.ngControl.valid = true;
    });

    it('should return true if control is touched and valid', () => {
      expect(component.valid).toBeTrue();
    });

    it('should return false if control is touched and invalid', () => {
      //@ts-ignore
      component.ngControl.valid = false;
      expect(component.valid).toBeFalse();
    });

    it('should return true if control is untouched', () => {
      //@ts-ignore
      component.ngControl.touched = false;
      //@ts-ignore
      component.ngControl.valid = false;
      expect(component.valid).toBeTrue();
    });
  });

  describe('set value():', () => {
    beforeEach(() => {
      //@ts-ignore
      component.innerValue = 'ECONOMY';
      component.options = [
        { label: 'Business', value: 'BUSINESS' },
        { label: 'Economy', value: 'ECONOMY' },
        { label: 'First Class', value: 'FIRST_CLASS' },
      ];
      //@ts-ignore
      spyOn(component, 'onChangeCallback');
    });

    it('should set the value and update the displayValue if any "option.value" is equal to innerValue', () => {
      component.value = 'BUSINESS';
      //@ts-ignore
      expect(component.innerValue).toEqual('BUSINESS');
      expect(component.displayValue).toEqual('Business');
      //@ts-ignore
      expect(component.onChangeCallback).toHaveBeenCalledOnceWith('BUSINESS');
    });

    it('should set the value and update the displayValue if type of innerValue is string', () => {
      component.value = '';
      //@ts-ignore
      expect(component.innerValue).toEqual('');
      expect(component.displayValue).toEqual('');
      //@ts-ignore
      expect(component.onChangeCallback).toHaveBeenCalledOnceWith('');
    });

    it('should set the value and update the displayValue if innerValue and defaultLabelProps is defined', () => {
      component.defaultLabelProp = 'vendor';
      component.value = { travelClass: 'BUSINESS', vendor: 'vendor1' };
      //@ts-ignore
      expect(component.innerValue).toEqual({ travelClass: 'BUSINESS', vendor: 'vendor1' });
      expect(component.displayValue).toEqual('vendor1');
      //@ts-ignore
      expect(component.onChangeCallback).toHaveBeenCalledOnceWith({ travelClass: 'BUSINESS', vendor: 'vendor1' });
    });

    it('should set the value and update the displayValue if none of the conditions holds true', () => {
      component.defaultLabelProp = '';
      component.value = { travelClass: 'BUSINESS', vendor: 'vendor1' };
      //@ts-ignore
      expect(component.innerValue).toEqual({ travelClass: 'BUSINESS', vendor: 'vendor1' });
      expect(component.displayValue).toEqual('');
      //@ts-ignore
      expect(component.onChangeCallback).toHaveBeenCalledOnceWith({ travelClass: 'BUSINESS', vendor: 'vendor1' });
    });
  });

  it('onBlur(): should call onTouchedCallback once', () => {
    //@ts-ignore
    spyOn(component, 'onTouchedCallback');
    component.onBlur();
    //@ts-ignore
    expect(component.onTouchedCallback).toHaveBeenCalledTimes(1);
  });

  describe('writeValue(): ', () => {
    beforeEach(() => {
      //@ts-ignore
      component.innerValue = 'ECONOMY';
      component.options = [
        { label: 'Business', value: 'BUSINESS' },
        { label: 'Economy', value: 'ECONOMY' },
        { label: 'First Class', value: 'FIRST_CLASS' },
      ];
    });

    it('should set the value and update the displayValue if any "option.value" is equal to innerValue', () => {
      component.writeValue('BUSINESS');
      //@ts-ignore
      expect(component.innerValue).toEqual('BUSINESS');
      expect(component.displayValue).toEqual('Business');
    });

    it('should set the value and update the displayValue if type of innerValue is string', () => {
      component.writeValue('');
      //@ts-ignore
      expect(component.innerValue).toEqual('');
      expect(component.displayValue).toEqual('');
    });

    it('should set the value and update the displayValue if innerValue and defaultLabelProps is defined', () => {
      component.defaultLabelProp = 'vendor';
      component.writeValue({ travelClass: 'BUSINESS', vendor: 'vendor1' });
      //@ts-ignore
      expect(component.innerValue).toEqual({ travelClass: 'BUSINESS', vendor: 'vendor1' });
      expect(component.displayValue).toEqual('vendor1');
    });

    it('should set the value and update the displayValue if none of the conditions holds true', () => {
      component.defaultLabelProp = '';
      component.writeValue({ travelClass: 'BUSINESS', vendor: 'vendor1' });
      //@ts-ignore
      expect(component.innerValue).toEqual({ travelClass: 'BUSINESS', vendor: 'vendor1' });
      expect(component.displayValue).toEqual('');
    });
  });

  it('registerOnChange(): should set onChangeCallback', () => {
    const onChange = (): void => {};
    component.registerOnChange(onChange);
    //@ts-ignore
    expect(component.onChangeCallback).toEqual(onChange);
  });

  it('registerOnTouched(): should set onTouchedCallback', () => {
    const onTouched = (): void => {};
    component.registerOnTouched(onTouched);
    //@ts-ignore
    expect(component.onTouchedCallback).toEqual(onTouched);
  });

  describe('handleDisplayNameException():', () => {
    it('should set the value and update the displayValue if innerValue is defined', () => {
      const value = { display_name: 'Marriot Hotels' };
      //@ts-ignore
      component.innerValue = value;
      component.handleDisplayNameException();
      expect(component.displayValue).toEqual(value.display_name);
    });

    it('should not set the value of displayValue is display_name is not available', () => {
      const value = { vendor: 'Marriot Hotels' };
      //@ts-ignore
      component.innerValue = value;
      component.handleDisplayNameException();
      expect(component.displayValue).toBeUndefined();
    });

    it('should not set the value of displayValue if innerValue is null or unset', () => {
      //@ts-ignore
      component.innerValue = null;
      component.handleDisplayNameException();
      expect(component.displayValue).toBeUndefined();
    });
  });
});
