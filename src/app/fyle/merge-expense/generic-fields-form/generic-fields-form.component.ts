import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  inject,
} from '@angular/core';
import { Subscription, noop } from 'rxjs';
import { filter } from 'rxjs/operators';
import { corporateCardTransaction } from 'src/app/core/models/platform/v1/cc-transaction.model';
import {
  UntypedFormGroup,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { CustomProperty } from 'src/app/core/models/custom-properties.model';
import { AllowedPaymentModes } from 'src/app/core/models/allowed-payment-modes.enum';
import { MergeExpensesOption } from 'src/app/core/models/merge-expenses-option.model';
import { MergeExpensesOptionsData } from 'src/app/core/models/merge-expenses-options-data.model';

@Component({
  selector: 'app-generic-fields-form',
  templateUrl: './generic-fields-form.component.html',
  styleUrls: ['./generic-fields-form.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: GenericFieldsFormComponent, multi: true }],
  standalone: false,
})
export class GenericFieldsFormComponent implements OnInit, ControlValueAccessor, OnDestroy {
  private formBuilder = inject(UntypedFormBuilder);

  private injector = inject(Injector);

  @Input() amountOptionsData: MergeExpensesOptionsData<string>;

  @Input() receiptOptions: MergeExpensesOption<string>[];

  @Input() dateOfSpendOptionsData: MergeExpensesOptionsData<string>;

  @Input() paymentModeOptionsData: MergeExpensesOptionsData<string>;

  @Input() attachments: FileObject[];

  @Input() projectOptionsData: MergeExpensesOptionsData<string>;

  @Input() billableOptionsData: MergeExpensesOptionsData<string>;

  @Input() categoryOptionsData: MergeExpensesOptionsData<string>;

  @Input() vendorOptionsData: MergeExpensesOptionsData<string>;

  @Input() taxGroupOptionsData: MergeExpensesOptionsData<string>;

  @Input() taxAmountOptionsData: MergeExpensesOptionsData<string>;

  @Input() constCenterOptionsData: MergeExpensesOptionsData<string>;

  @Input() purposeOptionsData: MergeExpensesOptionsData<string>;

  @Input() categoryDependentTemplate: TemplateRef<string[]>;

  @Input() CCCTxns: corporateCardTransaction[];

  @Input() disableFormElements: boolean;

  @Input() showBillable: boolean;

  @Input() projectDependentFieldsMapping: { [id: number]: CustomProperty<string>[] };

  @Input() costCenterDependentFieldsMapping: { [id: number]: CustomProperty<string>[] };

  @Output() fieldsTouched = new EventEmitter<string[]>();

  @Output() categoryChanged = new EventEmitter<number>();

  @Output() receiptChanged = new EventEmitter<string>();

  @Output() paymentModeChanged = new EventEmitter<AllowedPaymentModes>();

  genericFieldsFormGroup: UntypedFormGroup;

  onChangeSub: Subscription;

  projectDependentFields: CustomProperty<string>[] = [];

  costCenterDependentFields: CustomProperty<string>[] = [];

  onTouched: () => void = noop;

  isFieldTouched = (fieldName: string): boolean => this.genericFieldsFormGroup.get(fieldName).touched;

  ngOnInit(): void {
    this.genericFieldsFormGroup = this.formBuilder.group({
      amount: [, Validators.required],
      receipts_from: [],
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

    this.genericFieldsFormGroup.controls.receipts_from.valueChanges.subscribe((receiptsFrom: string) => {
      this.receiptChanged.emit(receiptsFrom);
    });

    this.genericFieldsFormGroup.valueChanges.subscribe((formControlNames: UntypedFormGroup) => {
      const touchedItems: string[] = [];
      Object.keys(formControlNames).forEach((key) => {
        if (this.isFieldTouched(key)) {
          touchedItems.push(key);
        }
      });
      this.fieldsTouched.emit(touchedItems);
    });
  }

  ngOnDestroy(): void {
    this.onChangeSub?.unsubscribe();
  }

  writeValue(value: UntypedFormGroup): void {
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
