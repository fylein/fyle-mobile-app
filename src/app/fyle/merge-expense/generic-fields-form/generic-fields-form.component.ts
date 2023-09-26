import { Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, TemplateRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CorporateCardExpense } from 'src/app/core/models/v2/corporate-card-expense.model';
import { FormGroup, ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, Validators } from '@angular/forms';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { CustomProperty } from 'src/app/core/models/custom-properties.model';
import { AllowedPaymentModes } from 'src/app/core/models/allowed-payment-modes.enum';

type Option = Partial<{
  label: string;
  value: string;
}>;

type OptionsData = Partial<{
  options: Option[];
  areSameValues: boolean;
  name: string;
  value: string;
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

  @Input() categoryDependentTemplate: TemplateRef<string[]>;

  @Input() CCCTxns: CorporateCardExpense[];

  @Input() disableFormElements: boolean;

  @Input() projectDependentFieldsMapping: { [id: number]: CustomProperty<string>[] };

  @Input() costCenterDependentFieldsMapping: { [id: number]: CustomProperty<string>[] };

  @Output() fieldsTouched = new EventEmitter<string[]>();

  @Output() categoryChanged = new EventEmitter<number>();

  @Output() receiptChanged = new EventEmitter<string>();

  @Output() paymentModeChanged = new EventEmitter<AllowedPaymentModes>();

  genericFieldsFormGroup: FormGroup;

  onChangeSub: Subscription;

  projectDependentFields: CustomProperty<string>[] = [];

  costCenterDependentFields: CustomProperty<string>[] = [];

  constructor(private formBuilder: FormBuilder, private injector: Injector) {}

  isFieldTouched = (fieldName: string): boolean => this.genericFieldsFormGroup.get(fieldName).touched;

  ngOnInit(): void {
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

    this.genericFieldsFormGroup.controls.category.valueChanges.subscribe((categoryId: number) => {
      this.categoryChanged.emit(categoryId);
    });

    this.genericFieldsFormGroup.controls.project.valueChanges
      .pipe(filter((projectId) => !!projectId))
      .subscribe((projectId: number) => {
        this.projectDependentFields = this.projectDependentFieldsMapping[projectId];
      });

    this.genericFieldsFormGroup.controls.costCenter.valueChanges
      .pipe(filter((costCenterId) => !!costCenterId))
      .subscribe((costCenterId: number) => {
        this.costCenterDependentFields = this.costCenterDependentFieldsMapping[costCenterId];
      });

    this.genericFieldsFormGroup.controls.paymentMode.valueChanges.subscribe((paymentMode: AllowedPaymentModes) => {
      this.paymentModeChanged.emit(paymentMode);
    });

    this.genericFieldsFormGroup.controls.receipt_ids.valueChanges.subscribe((receiptIds: string) => {
      this.receiptChanged.emit(receiptIds);
    });

    this.genericFieldsFormGroup.valueChanges.subscribe((formControlNames: FormGroup) => {
      const touchedItems: string[] = [];
      Object.keys(formControlNames).forEach((key) => {
        if (this.isFieldTouched(key)) {
          touchedItems.push(key);
        }
      });
      this.fieldsTouched.emit(touchedItems);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched = (): void => {};

  ngOnDestroy(): void {
    this.onChangeSub?.unsubscribe();
  }

  writeValue(value: FormGroup): void {
    if (value) {
      this.genericFieldsFormGroup.patchValue(value);
    }
  }

  registerOnChange(onChange: () => void): void {
    this.onChangeSub = this.genericFieldsFormGroup.valueChanges.subscribe(onChange);
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }
}
