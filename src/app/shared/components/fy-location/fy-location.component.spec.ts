import { TestBed, async, ComponentFixture, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { FyLocationComponent } from './fy-location.component';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FyLocationModalComponent } from './fy-location-modal/fy-location-modal.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('FyLocationComponent', () => {
  let component: FyLocationComponent;
  let fixture: ComponentFixture<FyLocationComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalPropertiesService: jasmine.SpyObj<ModalPropertiesService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);

    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [FyLocationComponent],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FyLocationComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
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
    expect(component.innerValue).toEqual(undefined);
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
    modalController.create.and.returnValue(
      Promise.resolve({
        present: () => {},
        onWillDismiss: () => dataPromise,
      } as any)
    );
    component.openModal();

    tick(1000);
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: FyLocationModalComponent,
      componentProps: {
        currentSelection: component.value,
        allowCustom: component.allowCustom,
        recentLocations: component.recentLocations,
        cacheName: component.cacheName,
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
    expect(component.innerValue).toEqual(undefined);
    expect(component.displayValue).toEqual('');
  });

  it('valid(): should return validInParent value if touchedInParent is true', () => {
    component.touchedInParent = true;
    component.validInParent = false;
    expect(component.valid).toBe(false);
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
