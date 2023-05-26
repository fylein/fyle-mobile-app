import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { DependentFieldComponent } from './dependent-field.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { DependentFieldModalComponent } from './dependent-field-modal/dependent-field-modal.component';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

describe('DependentFieldComponent', () => {
  let component: DependentFieldComponent;
  let fixture: ComponentFixture<DependentFieldComponent>;
  let componentElement: DebugElement;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    TestBed.configureTestingModule({
      declarations: [DependentFieldComponent, DependentFieldModalComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, FormsModule],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: ModalPropertiesService,
          useValue: modalPropertiesSpy,
        },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(DependentFieldComponent);
        fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);
        component = fixture.componentInstance;
        componentElement = fixture.debugElement;

        component.displayValue = 'Other Dep. Value 1';
        component.placeholder = 'Select value';
        component.label = 'Dependent Field Of Project';
        component.fieldId = 221309;
        component.parentFieldId = 221284;
        component.parentFieldValue = 'Project 1';

        modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
        modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;

        fixture.detectChanges();
      });
  }));

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('openModal(): should open the modal and update displayValue with the selected option', fakeAsync(() => {
    component.displayValue = 'Cost code 1';

    const defaultModalProperties = {
      cssClass: 'fy-modal',
      showBackdrop: true,
      canDismiss: true,
      backdropDismiss: true,
      animated: true,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: false,
    };

    const { displayValue, placeholder, label, fieldId, parentFieldId, parentFieldValue } = component;
    const expectedModalProperties = {
      component: DependentFieldModalComponent,
      componentProps: {
        currentSelection: displayValue,
        placeholder,
        label,
        fieldId,
        parentFieldId,
        parentFieldValue,
      },
      mode: 'ios' as any,
      ...defaultModalProperties,
    };

    const selectedValue = 'Cost code 100';

    const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onWillDismiss']);
    spyOn(component, 'onChangeCallback');

    const callbackFn = jasmine.createSpy('callbackFn');
    component.registerOnChange(callbackFn);

    modalController.create.and.returnValue(Promise.resolve(modalSpy));
    modalSpy.onWillDismiss.and.returnValue(Promise.resolve({ data: { value: selectedValue } }));
    modalProperties.getModalDefaultProperties.and.returnValue(defaultModalProperties);

    const inputElement = componentElement.query(By.css('.dependent-field__input'));
    inputElement.nativeElement.click();
    tick(500);
    fixture.detectChanges();

    expect(modalController.create).toHaveBeenCalledOnceWith(expectedModalProperties);
    expect(modalSpy.present).toHaveBeenCalledTimes(1);
    expect(modalSpy.onWillDismiss).toHaveBeenCalledTimes(1);
    expect(component.displayValue).toEqual(selectedValue);
    expect(component.onChangeCallback).toHaveBeenCalledOnceWith(selectedValue);
    expect(callbackFn).toHaveBeenCalledOnceWith(selectedValue);
  }));

  it('onBlur(): component should be touched', () => {
    const callbackFn = jasmine.createSpy('callbackFn');
    component.registerOnTouched(callbackFn);

    const inputElement = componentElement.query(By.css('.dependent-field__input'));
    inputElement.nativeElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(component.onTouchedCallback).toHaveBeenCalledTimes(1);
    expect(callbackFn).toHaveBeenCalledTimes(1);
    expect(inputElement.nativeElement.classList.contains('ng-touched')).toBe(true);
  });

  it('writeValue(): should write the formControl value to select field', () => {
    const dependentFieldValue = 'Dep Field 1';
    component.writeValue(dependentFieldValue);
    expect(component.displayValue).toEqual(dependentFieldValue);
  });
});
