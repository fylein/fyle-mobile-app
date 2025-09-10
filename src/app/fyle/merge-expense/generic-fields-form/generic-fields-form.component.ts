import { Component, Injector, Input, OnDestroy, OnInit, TemplateRef, inject, input, output } from '@angular/core';
import { Subscription, noop } from 'rxjs';
import { filter } from 'rxjs/operators';
import { corporateCardTransaction } from 'src/app/core/models/platform/v1/cc-transaction.model';
import {
  UntypedFormGroup,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  UntypedFormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { CustomProperty } from 'src/app/core/models/custom-properties.model';
import { AllowedPaymentModes } from 'src/app/core/models/allowed-payment-modes.enum';
import { MergeExpensesOption } from 'src/app/core/models/merge-expenses-option.model';
import { MergeExpensesOptionsData } from 'src/app/core/models/merge-expenses-options-data.model';
import { FySelectComponent } from '../../../shared/components/fy-select/fy-select.component';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ReceiptPreviewThumbnailComponent } from '../../../shared/components/receipt-preview-thumbnail/receipt-preview-thumbnail.component';
import { CardTransactionPreviewComponent } from '../card-transaction-preview/card-transaction-preview.component';
import { FySelectDisabledComponent } from '../../../shared/components/fy-select-disabled/fy-select-disabled.component';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-generic-fields-form',
  templateUrl: './generic-fields-form.component.html',
  styleUrls: ['./generic-fields-form.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: GenericFieldsFormComponent, multi: true }],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FySelectComponent,
    IonicModule,
    NgClass,
    ReceiptPreviewThumbnailComponent,
    CardTransactionPreviewComponent,
    FySelectDisabledComponent,
    NgTemplateOutlet,
    TranslocoPipe,
  ],
})
export class GenericFieldsFormComponent implements OnInit, ControlValueAccessor, OnDestroy {
  private formBuilder = inject(UntypedFormBuilder);

  private injector = inject(Injector);

  readonly amountOptionsData = input<MergeExpensesOptionsData<string>>(undefined);

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() receiptOptions: MergeExpensesOption<string>[];

  readonly dateOfSpendOptionsData = input<MergeExpensesOptionsData<string>>(undefined);

  readonly paymentModeOptionsData = input<MergeExpensesOptionsData<string>>(undefined);

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() attachments: FileObject[];

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() projectOptionsData: MergeExpensesOptionsData<string>;

  readonly billableOptionsData = input<MergeExpensesOptionsData<string>>(undefined);

  readonly categoryOptionsData = input<MergeExpensesOptionsData<string>>(undefined);

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() vendorOptionsData: MergeExpensesOptionsData<string>;

  readonly taxGroupOptionsData = input<MergeExpensesOptionsData<string>>(undefined);

  readonly taxAmountOptionsData = input<MergeExpensesOptionsData<string>>(undefined);

  readonly constCenterOptionsData = input<MergeExpensesOptionsData<string>>(undefined);

  readonly purposeOptionsData = input<MergeExpensesOptionsData<string>>(undefined);

  readonly categoryDependentTemplate = input<TemplateRef<string[]>>(undefined);

  readonly CCCTxns = input<corporateCardTransaction[]>(undefined);

  readonly disableFormElements = input<boolean>(undefined);

  readonly showBillable = input<boolean>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() projectDependentFieldsMapping: { [id: number]: CustomProperty<string>[] };

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() costCenterDependentFieldsMapping: { [id: number]: CustomProperty<string>[] };

  readonly fieldsTouched = output<string[]>();

  readonly categoryChanged = output<number>();

  readonly receiptChanged = output<string>();

  readonly paymentModeChanged = output<AllowedPaymentModes>();

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
