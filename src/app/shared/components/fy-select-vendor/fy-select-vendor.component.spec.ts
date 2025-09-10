import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { ModalController } from '@ionic/angular/standalone';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { FySelectVendorComponent } from './fy-select-vendor.component';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { FySelectVendorModalComponent } from './fy-select-modal/fy-select-vendor-modal.component';
import { getTextContent, getElementBySelector, click } from 'src/app/core/dom-helpers';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

describe('FySelectVendorComponent', () => {
  let component: FySelectVendorComponent;
  let fixture: ComponentFixture<FySelectVendorComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        MatIconTestingModule,
        MatIconModule,
        FormsModule,
        TranslocoModule,
        FySelectVendorComponent,
      ],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: ModalPropertiesService,
          useValue: modalPropertiesSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FySelectVendorComponent);
    component = fixture.componentInstance;

    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fySelectVendor.select': 'Select',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('valid(): should return validity of parent if touched is false', () => {
    component.touchedInParent = true;
    component.validInParent = false;

    const res = component.valid;
    expect(res).toBeFalse();
  });

  it('openModal(): should open modal', async () => {
    const currencyModalSpy = jasmine.createSpyObj('currencyModal', ['present', 'onWillDismiss']);
    currencyModalSpy.onWillDismiss.and.resolveTo({
      data: {
        value: 'value',
      },
    });

    modalProperties.getModalDefaultProperties.and.callThrough();
    modalController.create.and.resolveTo(currencyModalSpy);

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

  it('onBlur(): should call a function when onBlur fires and trigger on touched callback', () => {
    const callbackFn = jasmine.createSpy('callbackFn');
    component.registerOnTouched(callbackFn);

    const inputElement = fixture.debugElement.query(By.css('.fy-select-vendor--input'));
    inputElement.nativeElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(callbackFn).toHaveBeenCalledTimes(1);
  });

  describe('writeValue():', () => {
    it('should overwrite value', () => {
      component.innerValue = ['value2'];
      fixture.detectChanges();

      component.writeValue(['value']);
      expect(component.innerValue).toEqual(['value']);
    });

    it('should set display value to empty', () => {
      component.innerValue = 'value';
      fixture.detectChanges();

      component.writeValue(undefined);
      expect(component.displayValue).toEqual('');
    });
  });

  it('registerOnChange():should trigger on change callback when value changes', async () => {
    const callbackFn = jasmine.createSpy('callbackFn');
    component.registerOnChange(callbackFn);

    const currencyModalSpy = jasmine.createSpyObj('currencyModal', ['present', 'onWillDismiss']);
    currencyModalSpy.onWillDismiss.and.resolveTo({
      data: {
        value: 'value',
      },
    });

    modalProperties.getModalDefaultProperties.and.callThrough();
    modalController.create.and.resolveTo(currencyModalSpy);

    await component.openModal();
    await fixture.detectChanges();

    expect(callbackFn).toHaveBeenCalledTimes(1);
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
