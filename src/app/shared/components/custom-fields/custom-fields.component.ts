import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  Validators,
} from '@angular/forms';
import { isEqual } from 'lodash';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-custom-fields',
  templateUrl: './custom-fields.component.html',
  styleUrls: ['./custom-fields.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: CustomFieldsComponent,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: CustomFieldsComponent,
      multi: true,
    },
  ],
})
export class CustomFieldsComponent implements ControlValueAccessor, OnInit, OnDestroy, OnChanges, Validator {
  @Input() customInputsDetails: { name: string; type: string; value: any; mandatory: boolean; placeholder: string }[];

  @Input() isExpandedView = false;

  @Input() isConnected;

  customInputsForm: FormGroup = this.fb.group({
    customInputs: new FormArray([]),
  });

  onChangeSub: Subscription;

  constructor(private fb: FormBuilder) {}

  get customInputsFormArray() {
    return this.customInputsForm.controls.customInputs as FormArray;
  }

  validate(control: AbstractControl): ValidationErrors {
    if (!this.customInputsForm.valid) {
      return {
        ...this.customInputsForm.controls.customInputs.errors,
      };
    }
    return null;
  }

  onTouched = () => {};

  writeValue(customInputValues): void {
    if (customInputValues?.customInputs) {
      this.customInputsFormArray.clear();
      this.customInputsDetails.forEach((customInput) => {
        const currentValue = customInputValues?.customInputs.find(
          (customInputValue) => customInputValue.name === customInput.name
        );
        const validationToBeAdded =
          customInput.type !== 'BOOLEAN' && customInput.mandatory && this.isConnected && Validators.required;
        const valueToBeAdded =
          customInput.type !== 'DATE'
            ? currentValue.value
            : currentValue.value && moment(currentValue.value).format('y-MM-DD');
        const currentCustomInputControl = new FormControl(valueToBeAdded, validationToBeAdded);
        this.customInputsFormArray.push(currentCustomInputControl);
        this.customInputsForm.updateValueAndValidity();
      });
    }
  }

  registerOnChange(onChange): void {
    this.onChangeSub = this.customInputsForm.valueChanges.subscribe((_) => {
      const formValue = this.customInputsForm.value;
      onChange({
        ...formValue,
        customInputs: formValue.customInputs.map((val, i) => ({ ...this.customInputsDetails[i], value: val })),
      });
    });
  }

  registerOnTouched(onTouched): void {
    this.onTouched = onTouched;
  }

  ngOnInit() {
    console.log({ onInit: this.customInputsDetails });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !isEqual(changes.customInputsDetails?.previousValue, changes.customInputsDetails?.currentValue) ||
      !isEqual(changes.isConnected?.previousValue, changes.isConnected?.currentValue)
    ) {
      this.customInputsFormArray.clear();
      this.customInputsDetails.forEach((customInput) => {
        const validationToBeAdded =
          customInput.type !== 'BOOLEAN' && customInput.mandatory && this.isConnected && Validators.required;
        const valueToBeAdded =
          customInput.type !== 'DATE'
            ? customInput.value
            : customInput.value && moment(customInput.value).format('y-MM-DD');
        const currentCustomInputControl = new FormControl(valueToBeAdded, validationToBeAdded);
        this.customInputsFormArray.push(currentCustomInputControl);
        this.customInputsForm.updateValueAndValidity();
      });
    }
  }

  ngOnDestroy(): void {
    this.onChangeSub.unsubscribe();
  }
}
