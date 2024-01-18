import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, Validators } from '@angular/forms';
import { Observable, Subject, distinctUntilKeyChanged, finalize, map, of, takeUntil } from 'rxjs';
import { CustomProperty } from 'src/app/core/models/custom-properties.model';
import { ExpenseField } from 'src/app/core/models/v1/expense-field.model';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';

@Component({
  selector: 'app-dependent-fields',
  templateUrl: './dependent-fields.component.html',
  styleUrls: ['./dependent-fields.component.scss'],
})
export class DependentFieldsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() dependentFieldsFormArray: UntypedFormArray;

  @Input() dependentCustomFields: ExpenseField[];

  @Input() parentFieldId: number;

  @Input() parentFieldValue: string;

  @Input() txnCustomProperties: CustomProperty<string>[];

  dependentFields = [];

  isDependentFieldLoading = false;

  onPageExit$: Subject<void>;

  constructor(private dependentFieldsService: DependentFieldsService, private formBuilder: UntypedFormBuilder) {}

  ngOnInit(): void {
    return;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.parentFieldId?.firstChange) {
      this.onPageExit$ = new Subject();
    }

    if (changes?.parentFieldValue) {
      this.dependentFieldsFormArray?.clear();
      this.dependentFields = [];

      //In edit expense, if the parent field value is changed, we don't need the existing values of dependent fields
      const customProperties = changes.parentFieldValue.firstChange ? this.txnCustomProperties : [];
      this.addDependentFieldWithValue(customProperties, this.dependentCustomFields, {
        id: this.parentFieldId,
        value: this.parentFieldValue,
      });
    }
  }

  ngOnDestroy(): void {
    this.onPageExit$?.next(null);
    this.onPageExit$?.complete();
  }

  //Recursive method to add dependent fields with value
  addDependentFieldWithValue(
    txCustomProperties: CustomProperty<string>[],
    dependentFields: ExpenseField[],
    parentField: { id: number; value: string }
  ): void {
    //Get dependent field for the field whose id is parentFieldId
    const dependentField = dependentFields.find((dependentField) => dependentField.parent_field_id === parentField.id);

    if (dependentField) {
      //Get selected value for dependent field
      const dependentFieldValue = txCustomProperties.find(
        (customProp) => customProp.name === dependentField.field_name
      );

      if (dependentFieldValue?.value) {
        //Add dependent field with selected value
        this.addDependentField(dependentField, parentField.value, dependentFieldValue.value);

        //Add field which is dependent on the depenent field (if present)
        const currentField = {
          id: dependentField.id,
          value: dependentFieldValue.value,
        };
        this.addDependentFieldWithValue(txCustomProperties, dependentFields, currentField);
      } else {
        //If the dependent field does not have a value, trigger the onChange event for parent field
        //This will add a new field(if it exists) for the selected value of parent field
        this.isDependentFieldLoading = true;
        this.getDependentField(parentField.id, parentField.value)
          .pipe(finalize(() => (this.isDependentFieldLoading = false)))
          .subscribe((dependentFieldDetails) => {
            if (dependentFieldDetails?.dependentField) {
              this.addDependentField(dependentFieldDetails.dependentField, dependentFieldDetails.parentFieldValue);
            }
          });
      }
    }
  }

  getDependentField(
    parentFieldId: number,
    parentFieldValue: string
  ): Observable<{ dependentField: ExpenseField; parentFieldValue: string }> {
    const dependentField = this.dependentCustomFields.find(
      (dependentCustomField) => dependentCustomField.parent_field_id === parentFieldId
    );
    if (dependentField && parentFieldValue) {
      return this.dependentFieldsService
        .getOptionsForDependentField({
          fieldId: dependentField.id,
          parentFieldId,
          parentFieldValue,
          searchQuery: '',
        })
        .pipe(
          map((dependentFieldOptions) =>
            dependentFieldOptions?.length > 0 ? { dependentField, parentFieldValue } : null
          )
        );
    }
    return of(null);
  }

  addDependentField(dependentField: ExpenseField, parentFieldValue: string, value = null): void {
    const dependentFieldControl = this.formBuilder.group({
      id: dependentField.id,
      label: dependentField.field_name,
      parent_field_id: dependentField.parent_field_id,
      value: [value, (dependentField.is_mandatory || null) && Validators.required],
    });

    dependentFieldControl.valueChanges
      .pipe(takeUntil(this.onPageExit$), distinctUntilKeyChanged('value'))
      .subscribe((value: { id: number; label: string; parent_field_id: number; value: string }) => {
        this.onDependentFieldChanged(value);
      });

    this.dependentFields.push({
      id: dependentField.id,
      parentFieldId: dependentField.parent_field_id,
      parentFieldValue,
      field: dependentField.field_name,
      mandatory: dependentField.is_mandatory,
      control: dependentFieldControl,
      placeholder: dependentField.placeholder,
    });

    this.dependentFieldsFormArray.push(dependentFieldControl, { emitEvent: false });
  }

  removeAllDependentFields(updatedFieldIndex: number): void {
    //Remove all dependent field controls after the changed one
    for (let i = this.dependentFields.length - 1; i > updatedFieldIndex; i--) {
      this.dependentFieldsFormArray.removeAt(i);
    }

    //Removing fields from UI
    this.dependentFields = this.dependentFields.slice(0, updatedFieldIndex + 1);
  }

  onDependentFieldChanged(data: { id: number; label: string; parent_field_id: number; value: string }): void {
    //TODO: Fix Types Here
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const updatedFieldIndex = this.dependentFieldsFormArray.value.findIndex(
      (depField: { label: string }) => depField.label === data.label
    ) as number;

    //If this is not the last dependent field then remove all fields after this one and create new field based on this field.
    if (updatedFieldIndex !== this.dependentFieldsFormArray.length - 1) {
      this.removeAllDependentFields(updatedFieldIndex);
    }

    //Create new dependent field based on this field
    this.isDependentFieldLoading = true;
    this.getDependentField(data.id, data.value)
      .pipe(finalize(() => (this.isDependentFieldLoading = false)))
      .subscribe((dependentFieldDetails) => {
        if (dependentFieldDetails?.dependentField) {
          this.addDependentField(dependentFieldDetails.dependentField, dependentFieldDetails.parentFieldValue);
        }
      });
  }
}
