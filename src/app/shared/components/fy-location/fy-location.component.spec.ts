import { TestBed, ComponentFixture, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { FyLocationComponent } from './fy-location.component';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { FyLocationModalComponent } from './fy-location-modal/fy-location-modal.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('FyLocationComponent', () => {
  let component: FyLocationComponent;
  let fixture: ComponentFixture<FyLocationComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalPropertiesService: jasmine.SpyObj<ModalPropertiesService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });

    TestBed.configureTestingModule({
      imports: [FormsModule, TranslocoModule, FyLocationComponent,
        MatIconTestingModule],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FyLocationComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyLocation.label': 'location',
        'fyLocation.selectLocation': 'Select {{label}}',
        'fyLocationModal.loadingLocation': 'Loading location...',
        'fyLocationModal.enableLocationServicesTitle': 'Enable Location Services',
        'fyLocationModal.enableLocationTitle': 'Enable Location',
        'fyLocationModal.enableLocationServicesMessage':
          "To fetch your current location, please enable Location Services. Click 'Open Settings',then go to Privacy & Security and turn on Location Services",
        'fyLocationModal.enableLocationMessage':
          "To fetch your current location, please enable Location. Click 'Open Settings' and turn on Location",
        'fyLocationModal.openSettings': 'Open settings',
        'fyLocationModal.cancel': 'Cancel',
        'fyLocationModal.locationPermissionTitle': 'Location permission',
        'fyLocationModal.locationPermissionMessage':
          "To fetch current location, please allow Sage Expense Management to access your Location. Click on 'Open Settings', then enable both 'Location' and 'Precise Location' to continue.",
        'fyLocationModal.loadingCurrentLocation': 'Loading current location...',
        'fyLocationModal.search': 'Search',
        'fyLocationModal.clear': 'Clear',
        'fyLocationModal.save': 'Save',
        'fyLocationModal.enableLocationFromSettings': 'Enable location from Settings to fetch current location',
        'fyLocationModal.enable': 'Enable',
        'fyLocationModal.locationError': "Couldn't get current location. Please enter manually.",
        'fyLocationModal.useCurrentLocation': 'Use current location',
      };
      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{{${paramKey}}}`;
          translation = translation.replace(placeholder, params[paramKey]);
        });
      }

      return translation;
    });
    fixture.detectChanges();
  }));

  it('should create the FyLocationComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should update the displayValue when the value is set if innerValue is undefined', () => {
    const testValue = undefined;
    component.innerValue = { display: 'Test location', value: 'test_location' };
    spyOn(component, 'onChangeCallback');
    component.value = testValue;
    expect(component.innerValue).toBeUndefined();
    expect(component.displayValue).toEqual('');
    expect(component.onChangeCallback).toHaveBeenCalledOnceWith(undefined);
  });

  it('should update the displayValue and displayValue when the value is set and innerValue is defined', () => {
    const testValue = { display: 'Test location2', value: 'test_location2' };
    component.innerValue = { display: 'Test location', value: 'test_location' };
    spyOn(component, 'onChangeCallback');
    component.value = testValue;
    expect(component.innerValue).toEqual(testValue);
    expect(component.displayValue).toEqual('Test location2');
    expect(component.onChangeCallback).toHaveBeenCalledOnceWith(testValue);
  });

  it('openModal(): should open the location selection modal when the openModal method is called', fakeAsync(() => {
    component.value = 'Previous Value';
    const dataPromise = new Promise((resolve) => {
      setTimeout(() => resolve({ data: { selection: 'TestValue' } }), 2000); // test was updating the component.value instantaneously, therefore a delay was required;
    });
    modalController.create.and.resolveTo({
      present: () => {},
      onWillDismiss: () => dataPromise,
    } as any);
    component.openModal();

    tick(1000);
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: FyLocationModalComponent,
      componentProps: {
        currentSelection: component.value,
        recentLocations: component.recentLocations(),
        cacheName: component.cacheName(),
        disableEnteringManualLocation: false,
      },
    });
    tick(1000);
    expect(component.value).toEqual('TestValue');
  }));

  it('should call the onTouchedCallback method when the onBlur method is called', () => {
    spyOn(component, 'onTouchedCallback');
    component.onBlur();
    expect(component.onTouchedCallback).toHaveBeenCalled();
  });

  it('writeValue(): should set innerValue when the writeValue method is called with a different value and set displayValue to selection.display', () => {
    component.innerValue = { display: 'Test location2', value: 'test_location2' };
    const testValue = { display: 'Test location', value: 'test_location' };
    component.writeValue(testValue);
    expect(component.innerValue).toEqual(testValue);
    expect(component.displayValue).toEqual('Test location');
  });

  it('writeValue(): should set innerValue when the writeValue method is called with a different value and set displayValue to empty string', () => {
    component.innerValue = { display: 'Test location2', value: 'test_location2' };
    const testValue = undefined;
    component.writeValue(testValue);
    expect(component.innerValue).toBeUndefined();
    expect(component.displayValue).toEqual('');
  });

  it('valid(): should return validInParent value if touchedInParent is true', () => {
    component.touchedInParent = true;
    component.validInParent = false;
    expect(component.valid).toBeFalse();
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
