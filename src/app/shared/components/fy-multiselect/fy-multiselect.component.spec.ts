import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { FyMultiselectComponent } from './fy-multiselect.component';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { FyMultiselectModalComponent } from './fy-multiselect-modal/fy-multiselect-modal.component';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { By } from '@angular/platform-browser';

describe('FyMultiselectComponent', () => {
  let component: FyMultiselectComponent;
  let fixture: ComponentFixture<FyMultiselectComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);

    TestBed.configureTestingModule({
      declarations: [FyMultiselectComponent],
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
    fixture = TestBed.createComponent(FyMultiselectComponent);
    component = fixture.componentInstance;

    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;

    component.options = [
      {
        label: 'Label1',
        value: 'value1',
      },
    ];
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
    const selectionModalSpy = jasmine.createSpyObj('selectionModal', ['present', 'onWillDismiss']);
    selectionModalSpy.onWillDismiss.and.returnValue(
      Promise.resolve({
        data: {
          selected: ['value'],
        },
      })
    );

    modalProperties.getModalDefaultProperties.and.callThrough();
    modalController.create.and.returnValue(Promise.resolve(selectionModalSpy));

    await component.openModal();

    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: FyMultiselectModalComponent,
      componentProps: {
        options: component.options,
        currentSelections: undefined,
        selectModalHeader: component.selectModalHeader,
        subheader: component.subheader,
      },
      mode: 'ios',
    });
    expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
  });

  it('onBlur(): should call a function when onBlur fires', () => {
    spyOn(component, 'onTouchedCallback');

    const inputElement = fixture.debugElement.query(By.css('.fy-select--input'));
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
    const input = getElementBySelector(fixture, '.fy-select--input') as HTMLElement;

    click(input);
    expect(component.openModal).toHaveBeenCalledTimes(1);
  });
});
