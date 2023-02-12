import { Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, TemplateRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CorporateCardExpense } from 'src/app/core/models/v2/corporate-card-expense.model';
import {
  FormControl,
  FormGroup,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { FileObject } from 'src/app/core/models/file_obj.model';

type Option = Partial<{
  label: string;
  value: any;
}>;

type OptionsData = Partial<{
  options: Option[];
  areSameValues: boolean;
  name: string;
  value: any;
}>;

type CustomInput = Partial<{
  control: AbstractControl;
  id: string;
  mandatory: boolean;
  name: string;
  options: Option[];
  placeholder: string;
  prefix: string;
  type: string;
  value: string;
  parent_field_id: number;
}>;

@Component({
  selector: 'app-generic-fields-form',
  templateUrl: './generic-fields-form.component.html',
  styleUrls: ['./generic-fields-form.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: GenericFieldsFormComponent, multi: true }],
})
export class GenericFieldsFormComponent implements OnInit, ControlValueAccessor, OnDestroy {
  @Input() amountOptionsData: OptionsData;

  @Input() receiptOptions: Option[];

  @Input() dateOfSpendOptionsData: OptionsData;

  @Input() paymentModeOptionsData: OptionsData;

  @Input() attachments: FileObject[];

  @Input() projectOptionsData: OptionsData;

  @Input() billableOptionsData: OptionsData;

  @Input() categoryOptionsData: OptionsData;

  @Input() vendorOptionsData: OptionsData;

  @Input() taxGroupOptionsData: OptionsData;

  @Input() taxAmountOptionsData: OptionsData;

  @Input() constCenterOptionsData: OptionsData;

  @Input() purposeOptionsData: OptionsData;

  @Input() categoryDependentTemplate: TemplateRef<any>;

  @Input() CCCTxns: CorporateCardExpense[];

  @Input() disableFormElements: boolean;

  @Input() projectCustomInputsMapping;

  @Input() dependentFields: CustomInput[];

  @Output() fieldsTouched = new EventEmitter<string[]>();

  @Output() categoryChanged = new EventEmitter<void>();

  @Output() receiptChanged = new EventEmitter<void>();

  @Output() paymentModeChanged = new EventEmitter<void>();

  genericFieldsFormGroup: FormGroup;

  onChangeSub: Subscription;

  constructor(private formBuilder: FormBuilder, private injector: Injector) {}

  ngOnInit() {
    this.genericFieldsFormGroup = this.formBuilder.group({
      amount: [, Validators.required],
      receipt_ids: [],
      dateOfSpend: [],
      paymentMode: [, Validators.required],
      project: [],
      billable: [],
      vendor: [],
      category: [],
      tax_group: [],
      tax_amount: [],
      costCenter: [],
      purpose: [],
    });

    this.genericFieldsFormGroup.controls.category.valueChanges.subscribe((categoryId) => {
      this.categoryChanged.emit(categoryId);
    });

    this.genericFieldsFormGroup.controls.paymentMode.valueChanges.subscribe((paymentMode) => {
      this.paymentModeChanged.emit(paymentMode);
    });

    this.genericFieldsFormGroup.controls.receipt_ids.valueChanges.subscribe((receiptIds) => {
      this.receiptChanged.emit(receiptIds);
    });

    this.genericFieldsFormGroup.valueChanges.subscribe((formControlNames) => {
      const touchedItems = [];
      Object.keys(formControlNames).forEach((key) => {
        if (this.genericFieldsFormGroup.get(key).touched) {
          touchedItems.push(key);
        }
      });
      this.fieldsTouched.emit(touchedItems);
    });
  }

  onTouched = () => {};

  ngOnDestroy(): void {
    this.onChangeSub.unsubscribe();
  }

  writeValue(value: any) {
    if (value) {
      this.genericFieldsFormGroup.patchValue(value);
    }
  }

  registerOnChange(onChange): void {
    this.onChangeSub = this.genericFieldsFormGroup.valueChanges.subscribe(onChange);
  }

  registerOnTouched(onTouched): void {
    this.onTouched = onTouched;
  }
}
