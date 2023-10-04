import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Injector } from '@angular/core';
import { Subscription, noop } from 'rxjs';
import { FormGroup, ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormArray } from '@angular/forms';
import { CustomInputsField } from 'src/app/core/models/custom-inputs-field.model';

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

interface CombinedOptions {
  [key: string]: OptionsData;
}

@Component({
  selector: 'app-custom-inputs-fields-form',
  templateUrl: './custom-inputs-fields-form.component.html',
  styleUrls: ['./custom-inputs-fields-form.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: CustomInputsFieldsFormComponent, multi: true }],
})
export class CustomInputsFieldsFormComponent implements OnInit, ControlValueAccessor, OnDestroy, OnChanges {
  @Input() customInputs: CustomInputsField[];

  @Input() combinedCustomProperties: CombinedOptions;

  @Input() disableFormElements: boolean;

  onChangeSub: Subscription;

  customFieldsForm: FormGroup;

  customFields: CustomInputsField[];

  onTouched: () => void = noop;

  constructor(private formBuilder: FormBuilder, private injector: Injector) {}

  ngOnInit(): void {
    this.customFieldsForm = this.formBuilder.group({
      fields: new FormArray([]),
    });
  }

  generateCustomForm(): void {
    const customFieldsFormArray = this.customFieldsForm?.controls?.fields as FormArray;
    customFieldsFormArray.clear();
    for (const customField of this.customInputs) {
      customFieldsFormArray.push(
        this.formBuilder.group({
          name: [customField.name],
          value: [customField.value],
        })
      );
    }
    customFieldsFormArray.updateValueAndValidity();
    this.customFields = this.customInputs.map((customField, i) => ({
      ...customField,
      control: customFieldsFormArray.at(i),
    }));
  }

  ngOnDestroy(): void {
    this.onChangeSub?.unsubscribe();
  }

  ngOnChanges(): void {
    if (this.customFieldsForm?.controls) {
      this.generateCustomForm();
    }
  }

  writeValue(value: FormGroup): void {
    if (value) {
      this.customFieldsForm.controls.fields.patchValue(value);
    }
  }

  registerOnChange(onChange: () => void): void {
    this.onChangeSub = this.customFieldsForm.valueChanges.subscribe(onChange);
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }
}
