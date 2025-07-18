import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GenericFieldsFormComponent } from './generic-fields-form.component';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { dependentCustomProperties } from 'src/app/core/mock-data/custom-property.data';
import { AllowedPaymentModes } from 'src/app/core/models/allowed-payment-modes.enum';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('GenericFieldsFormComponent', () => {
  let component: GenericFieldsFormComponent;
  let fixture: ComponentFixture<GenericFieldsFormComponent>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      declarations: [GenericFieldsFormComponent],
      imports: [IonicModule.forRoot(), TranslocoModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(GenericFieldsFormComponent);
    component = fixture.componentInstance;

    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'genericFieldsForm.amount': 'Amount',
        'genericFieldsForm.selectAmount': 'Select amount',
        'genericFieldsForm.invalidAmountError': 'Please select a valid amount',
        'genericFieldsForm.dateOfSpend': 'Date of Spend',
        'genericFieldsForm.selectSpendDate': 'Select spend date',
        'genericFieldsForm.paymentMode': 'Payment mode',
        'genericFieldsForm.selectPaymentMode': 'Select payment mode',
        'genericFieldsForm.invalidPaymentModeError': 'Please select a valid payment mode',
        'genericFieldsForm.receipt': 'Receipt',
        'genericFieldsForm.selectReceipt': 'Select receipt',
        'genericFieldsForm.noReceiptPlaceholder': 'No receipt',
        'genericFieldsForm.project': 'Project',
        'genericFieldsForm.selectProject': 'Select project',
        'genericFieldsForm.billable': 'Billable',
        'genericFieldsForm.selectBillable': 'Select billable',
        'genericFieldsForm.merchant': 'Merchant',
        'genericFieldsForm.selectMerchant': 'Select merchant',
        'genericFieldsForm.category': 'Category',
        'genericFieldsForm.selectCategory': 'Select category',
        'genericFieldsForm.taxGroup': 'Tax Group',
        'genericFieldsForm.selectTaxGroup': 'Select tax group',
        'genericFieldsForm.tax': 'Tax',
        'genericFieldsForm.selectTax': 'Select tax',
        'genericFieldsForm.costCenter': 'Cost center',
        'genericFieldsForm.selectCostCenter': 'Select cost center',
        'genericFieldsForm.purpose': 'Purpose',
        'genericFieldsForm.selectPurpose': 'Select purpose',
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit():', () => {
    it('should emit categoryChanged event if category option changes', () => {
      spyOn(component.categoryChanged, 'emit');
      component.ngOnInit();
      component.genericFieldsFormGroup.controls.category.setValue(32108);
      expect(component.categoryChanged.emit).toHaveBeenCalledOnceWith(32108);
    });

    it('should assign projectDependentFields to projectDependentFieldsMapping.projectId if project option changes', () => {
      component.projectDependentFieldsMapping = {
        3943: dependentCustomProperties,
      };
      component.ngOnInit();
      expect(component.projectDependentFields).toEqual([]);
      component.genericFieldsFormGroup.controls.project.setValue(3943);
      expect(component.projectDependentFields).toEqual(dependentCustomProperties);
    });

    it('should assign costCenterDependentFields to costCenterDependentFieldsMapping.costCenterId if cost center option changes', () => {
      component.costCenterDependentFieldsMapping = {
        13795: dependentCustomProperties,
      };
      component.ngOnInit();
      expect(component.costCenterDependentFields).toEqual([]);
      component.genericFieldsFormGroup.controls.costCenter.setValue(13795);
      expect(component.costCenterDependentFields).toEqual(dependentCustomProperties);
    });

    it('should emit paymentModeChanged event if payment mode option changes', () => {
      spyOn(component.paymentModeChanged, 'emit');
      component.ngOnInit();
      component.genericFieldsFormGroup.controls.paymentMode.setValue(AllowedPaymentModes.PERSONAL_CASH_ACCOUNT);
      expect(component.paymentModeChanged.emit).toHaveBeenCalledOnceWith(AllowedPaymentModes.PERSONAL_CASH_ACCOUNT);
    });

    it('should emit receiptChanged event if receipt option changes', () => {
      spyOn(component.receiptChanged, 'emit');
      component.ngOnInit();
      component.genericFieldsFormGroup.controls.receipts_from.setValue('txErhlkzewZF');
      expect(component.receiptChanged.emit).toHaveBeenCalledOnceWith('txErhlkzewZF');
    });

    it('should emit fieldsTouched event if any field is touched', () => {
      spyOn(component.fieldsTouched, 'emit');
      spyOn(component, 'isFieldTouched').and.returnValues(true);
      component.ngOnInit();
      component.genericFieldsFormGroup.controls.amount.setValue(100);
      expect(component.fieldsTouched.emit).toHaveBeenCalledOnceWith(['amount']);
    });
  });

  it('ngOnDestroy(): should unsubscribe from onChangeSub', () => {
    component.onChangeSub = jasmine.createSpyObj('onChangeSub', ['unsubscribe']);
    component.ngOnDestroy();
    expect(component.onChangeSub.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('writeValue(): should patch value to form control', () => {
    component.genericFieldsFormGroup = new UntypedFormBuilder().group({
      location_1: new UntypedFormControl(),
    });
    const newValue = new UntypedFormBuilder().group({
      location_1: new UntypedFormControl(200),
    });
    spyOn(component.genericFieldsFormGroup, 'patchValue');
    component.writeValue(newValue);
    expect(component.genericFieldsFormGroup.patchValue).toHaveBeenCalledOnceWith(newValue);
  });

  it('registerOnChange(): should subscribe to value changes', () => {
    const onChange = (): void => {};
    spyOn(component.genericFieldsFormGroup.valueChanges, 'subscribe');
    component.registerOnChange(onChange);
    expect(component.genericFieldsFormGroup.valueChanges.subscribe).toHaveBeenCalledOnceWith(onChange);
  });

  it('registerOnTouched(): should set onTouched', () => {
    const onTouched = (): void => {};
    component.registerOnTouched(onTouched);
    expect(component.onTouched).toEqual(onTouched);
  });
});
