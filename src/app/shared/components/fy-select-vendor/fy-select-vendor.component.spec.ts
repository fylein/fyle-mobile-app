import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { FySelectVendorComponent } from './fy-select-vendor.component';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { FySelectVendorModalComponent } from './fy-select-modal/fy-select-vendor-modal.component';
import { getTextContent, getElementBySelector, click } from 'src/app/core/dom-helpers';
import { By } from '@angular/platform-browser';

describe('FySelectVendorComponent', () => {
  let component: FySelectVendorComponent;
  let fixture: ComponentFixture<FySelectVendorComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);

    TestBed.configureTestingModule({
      declarations: [FySelectVendorComponent],
      imports: [IonicModule.forRoot(), MatIconTestingModule, MatIconModule, FormsModule],
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
    fixture = TestBed.createComponent(FySelectVendorComponent);
    component = fixture.componentInstance;

    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('valid(): should return validity of parent if touched is false', () => {
    component.touchedInParent = true;
    component.validInParent = false;

    const res = component.valid;
    expect(res).toEqual(false);
  });

  it('openModal(): should open modal', async () => {
    const currencyModalSpy = jasmine.createSpyObj('currencyModal', ['present', 'onWillDismiss']);
    currencyModalSpy.onWillDismiss.and.returnValue(
      Promise.resolve({
        data: {
          value: 'value',
        },
      })
    );

    modalProperties.getModalDefaultProperties.and.callThrough();
    modalController.create.and.returnValue(Promise.resolve(currencyModalSpy));

    await component.openModal();

    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: FySelectVendorModalComponent,
      componentProps: {
        currentSelection: undefined,
      },
      mode: 'ios',
    });
    expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
  });

  it('onBlur(): should call a function when onBlur fires', () => {
    spyOn(component, 'onTouchedCallback');

    const inputElement = fixture.debugElement.query(By.css('.fy-select-vendor--input'));
    inputElement.nativeElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(component.onTouchedCallback).toHaveBeenCalledTimes(1);
  });

  describe('writeValue():', () => {
    it('should overwrite value', () => {
      //@ts-ignore
      component.innerValue = ['value2'];
      fixture.detectChanges();

      component.writeValue(['value']);
      //@ts-ignore
      expect(component.innerValue).toEqual(['value']);
    });

    it('should set display value to empty', () => {
      component.innerValue = 'value';
      fixture.detectChanges();

      component.writeValue(undefined);
      expect(component.displayValue).toEqual('');
    });
  });

  it('registerOnChange():', () => {
    const callbackFn = jasmine.createSpy('callbackFn');
    //@ts-ignore
    spyOn(component, 'onChangeCallback').and.callThrough();

    component.registerOnChange(callbackFn);
    //@ts-ignore
    expect(component.onChangeCallback).toEqual(callbackFn);
  });

  it('registerOnTouched():', () => {
    const callbackFn = jasmine.createSpy('callbackFn');
    //@ts-ignore
    spyOn(component, 'onTouchedCallback').and.callThrough();

    component.registerOnTouched(callbackFn);
    //@ts-ignore
    expect(component.onTouchedCallback).toEqual(callbackFn);
  });

  it('should show label', () => {
    component.label = 'Label';
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '[data-testid="label"]'))).toEqual('Label');
  });

  it('should open modal when clicked on', () => {
    spyOn(component, 'openModal');
    const input = getElementBySelector(fixture, '.fy-select-vendor--input') as HTMLElement;

    click(input);
    expect(component.openModal).toHaveBeenCalledTimes(1);
  });
});
