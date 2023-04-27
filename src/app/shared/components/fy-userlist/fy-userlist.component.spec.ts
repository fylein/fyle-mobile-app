import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { FyUserlistComponent } from './fy-userlist.component';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { FormsModule } from '@angular/forms';
import { FyUserlistModalComponent } from '../fy-userlist/fy-userlist-modal/fy-userlist-modal.component';

describe('FyUserlistComponent', () => {
  let component: FyUserlistComponent;
  let fixture: ComponentFixture<FyUserlistComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);

    TestBed.configureTestingModule({
      declarations: [FyUserlistComponent],
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
    }).compileComponents();
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;

    fixture = TestBed.createComponent(FyUserlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('openModal():', () => {
    it('should open the currency modal with some value in it if present', fakeAsync(() => {
      component.value = ['ajain+12+12+1@fyle.in'];
      component.allowCustomValues = true;
      const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onWillDismiss']);
      const selected = ['ajain+12+12+1@fyle.in'];
      modalController.create.and.returnValue(Promise.resolve(modalSpy));
      modalSpy.onWillDismiss.and.returnValue(Promise.resolve({ data: { selected } }));

      component.openModal();
      tick(500);
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: FyUserlistModalComponent,
        componentProps: {
          currentSelections: component.value,
          allowCustomValues: component.allowCustomValues,
        },
        mode: 'ios',
        ...modalProperties.getModalDefaultProperties(),
      });
      expect(modalSpy.present).toHaveBeenCalledTimes(1);
    }));

    it('should open the currency modal with empty array if no value is present', fakeAsync(() => {
      component.allowCustomValues = true;
      const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onWillDismiss']);
      const selected = [];
      modalController.create.and.returnValue(Promise.resolve(modalSpy));
      modalSpy.onWillDismiss.and.returnValue(Promise.resolve({ data: { selected } }));

      component.openModal();
      tick(500);
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: FyUserlistModalComponent,
        componentProps: {
          currentSelections: [],
          allowCustomValues: component.allowCustomValues,
        },
        mode: 'ios',
        ...modalProperties.getModalDefaultProperties(),
      });
      expect(modalSpy.present).toHaveBeenCalledTimes(1);
    }));
  });

  it('onBlur(): should call onTouchedCallback', () => {
    spyOn(component, 'onTouchedCallback');
    component.onBlur();
    expect(component.onTouchedCallback).toHaveBeenCalledTimes(1);
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

  it('writeValue(): should set the inner value and display value when a value is written', () => {
    const value = ['ajain1212@fyle.in', 'aiyush.d@fyle.in'];
    component.writeValue(value);
    component.displayValue = 'ajain1212@fyle.in,aiyush.d@fyle.in';
    expect(component.innerValue).toEqual(value);
  });

  it('writeValue(): should set the display value to an empty array when a value is an empty array', () => {
    const value = [];
    component.writeValue(value);
    component.displayValue = '';
    expect(component.innerValue).toEqual(value);
  });

  it('should return validInParent if touchedInParent is true', () => {
    component.touchedInParent = true;
    component.validInParent = true;
    const result = component.valid;
    expect(result).toBeTrue();
  });
});
