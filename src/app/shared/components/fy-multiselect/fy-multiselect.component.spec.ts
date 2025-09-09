import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
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
import { of } from 'rxjs';

describe('FyMultiselectComponent', () => {
  let component: FyMultiselectComponent;
  let fixture: ComponentFixture<FyMultiselectComponent>;
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
    imports: [IonicModule.forRoot(), MatIconTestingModule, MatIconModule, FormsModule, TranslocoModule, FyMultiselectComponent],
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
    fixture = TestBed.createComponent(FyMultiselectComponent);
    component = fixture.componentInstance;

    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyMultiselect.select': 'Select',
        'fyMultiselect.selectItems': 'Select items',
        'fyMultiselect.allItems': 'All items',
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
    expect(res).toBeFalse();
  });

  it('openModal(): should open modal', async () => {
    const selectionModalSpy = jasmine.createSpyObj('selectionModal', ['present', 'onWillDismiss']);
    selectionModalSpy.onWillDismiss.and.resolveTo({
      data: {
        selected: ['value'],
      },
    });

    modalProperties.getModalDefaultProperties.and.callThrough();
    modalController.create.and.resolveTo(selectionModalSpy);

    await component.openModal();

    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: FyMultiselectModalComponent,
      componentProps: {
        options: component.options,
        currentSelections: [],
        selectModalHeader: component.selectModalHeader,
        subheader: component.subheader,
      },
      mode: 'ios',
    });
    expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
  });

  it('onBlur(): should call a function when onBlur fires and registerOnTouched to trigger', () => {
    const callbackFn = jasmine.createSpy('callbackFn');
    component.registerOnTouched(callbackFn);

    const inputElement = fixture.debugElement.query(By.css('.fy-select--input'));
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
  });

  it('registerOnChange(): should check if callback is triggered when value changes', async () => {
    const callbackFn = jasmine.createSpy('callbackFn');

    component.registerOnChange(callbackFn);

    const selectionModalSpy = jasmine.createSpyObj('selectionModal', ['present', 'onWillDismiss']);
    selectionModalSpy.onWillDismiss.and.resolveTo({
      data: {
        selected: ['value'],
      },
    });

    modalProperties.getModalDefaultProperties.and.callThrough();
    modalController.create.and.resolveTo(selectionModalSpy);

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
    const input = getElementBySelector(fixture, '.fy-select--input') as HTMLElement;

    click(input);
    expect(component.openModal).toHaveBeenCalledTimes(1);
  });
});
