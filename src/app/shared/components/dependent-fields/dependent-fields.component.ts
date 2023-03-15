import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  distinctUntilKeyChanged,
  filter,
  finalize,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { CustomProperty } from 'src/app/core/models/custom-properties.model';
import { ExpenseField } from 'src/app/core/models/v1/expense-field.model';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';

@Component({
  selector: 'app-dependent-fields',
  templateUrl: './dependent-fields.component.html',
  styleUrls: ['./dependent-fields.component.scss'],
})
export class DependentFieldsComponent implements OnInit, OnDestroy {
  @Input() expenseForm: FormGroup;

  @Input() txnFields: any;

  @Input() dependentCustomFields: ExpenseField[];

  dependentFields = [];

  isDependentFieldLoading = false;

  onPageExit$: Subject<void>;

  constructor(private dependentFieldsService: DependentFieldsService, private formBuilder: FormBuilder) {}

  get dependentFieldControls() {
    return this.expenseForm?.controls?.dependent_fields as FormArray;
  }

  ngOnInit() {
    this.onPageExit$ = new Subject();
    this.expenseForm?.controls.project.valueChanges
      .pipe(
        takeUntil(this.onPageExit$),
        tap(() => {
          this.dependentFieldControls?.clear();
          this.dependentFields = [];
        }),
        filter((project) => !!project),
        switchMap((project) => {
          this.isDependentFieldLoading = true;
          return this.getDependentField(this.txnFields.project_id.id, project.project_name).pipe(
            finalize(() => (this.isDependentFieldLoading = false))
          );
        })
      )
      .subscribe((res) => {
        if (res?.dependentField) {
          this.addDependentField(res.dependentField, res.parentFieldValue);
        }
      });
  }

  ngOnDestroy() {
    this.onPageExit$.next(null);
    this.onPageExit$.complete();
  }

  private getDependentField(
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

  private addDependentField(dependentField: ExpenseField, parentFieldValue: string, value = null): void {
    const dependentFieldControl = this.formBuilder.group({
      id: dependentField.id,
      label: dependentField.field_name,
      parent_field_id: dependentField.parent_field_id,
      value: [value, (dependentField.is_mandatory || null) && Validators.required],
    });

    dependentFieldControl.valueChanges
      .pipe(takeUntil(this.onPageExit$), distinctUntilKeyChanged('value'))
      .subscribe((value) => {
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

    this.dependentFieldControls.push(dependentFieldControl, { emitEvent: false });
  }

  private removeAllDependentFields(updatedFieldIndex: number) {
    //Remove all dependent field controls after the changed one
    for (let i = this.dependentFields.length - 1; i > updatedFieldIndex; i--) {
      this.dependentFieldControls.removeAt(i);
    }

    //Removing fields from UI
    this.dependentFields = this.dependentFields.slice(0, updatedFieldIndex + 1);
  }

  private onDependentFieldChanged(data: { id: number; label: string; parent_field_id: number; value: string }): void {
    const updatedFieldIndex = this.dependentFieldControls.value.findIndex((depField) => depField.label === data.label);

    //If this is not the last dependent field then remove all fields after this one and create new field based on this field.
    if (updatedFieldIndex !== this.dependentFieldControls.length - 1) {
      this.removeAllDependentFields(updatedFieldIndex);
    }

    //Create new dependent field based on this field
    this.isDependentFieldLoading = true;
    this.getDependentField(data.id, data.value)
      .pipe(finalize(() => (this.isDependentFieldLoading = false)))
      .subscribe((res) => {
        if (res?.dependentField) {
          this.addDependentField(res.dependentField, res.parentFieldValue);
        }
      });
  }

  //Recursive method to add dependent fields with value
  private addDependentFieldWithValue(
    txCustomProperties: CustomProperty<string>[],
    dependentFields: ExpenseField[],
    parentField: { id: number; value: string }
  ) {
    //Get dependent field for the field whose id is parentFieldId
    const dependentField = dependentFields.find((dependentField) => dependentField.parent_field_id === parentField.id);

    if (dependentField) {
      //Get selected value for dependent field
      const dependentFieldValue = txCustomProperties.find(
        (customProp) => customProp.name === dependentField.field_name
      );

      if (dependentFieldValue?.value) {
        //Add dependent field with selected value
        this.addDependentField(dependentField, parentField.value, dependentFieldValue?.value);

        //Add field which is dependent on the depenent field (if present)
        const currentField = {
          id: dependentField.id,
          value: dependentFieldValue?.value,
        };
        this.addDependentFieldWithValue(txCustomProperties, dependentFields, currentField);
      } else {
        //If the dependent field does not have a value, trigger the onChange event for parent field
        //This will add a new field(if it exists) for the selected value of parent field
        this.isDependentFieldLoading = true;
        this.getDependentField(parentField.id, parentField.value)
          .pipe(finalize(() => (this.isDependentFieldLoading = false)))
          .subscribe((res) => {
            if (res?.dependentField) {
              this.addDependentField(res.dependentField, res.parentFieldValue);
            }
          });
      }
    }
  }
}
