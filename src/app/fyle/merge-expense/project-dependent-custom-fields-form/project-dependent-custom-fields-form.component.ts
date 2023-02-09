import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  FormGroup,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormBuilder,
  FormArray,
  AbstractControl,
} from '@angular/forms';

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

interface CombinedOptions {
  [key: string]: OptionsData;
}

@Component({
  selector: 'app-project-dependent-custom-fields-form',
  templateUrl: './project-dependent-custom-fields-form.component.html',
  styleUrls: ['./project-dependent-custom-fields-form.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: ProjectDependentCustomFieldsFormComponent, multi: true }],
})
export class ProjectDependentCustomFieldsFormComponent implements OnInit, ControlValueAccessor, OnDestroy, OnChanges {
  @Input() customInputs: CustomInput[];

  @Input() combinedCustomProperties: CombinedOptions;

  @Input() disableFormElements: boolean;

  onChangeSub: Subscription;

  customFieldsForm: FormGroup;

  customFields: CustomInput[];

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.customFieldsForm = this.formBuilder.group({
      fields: new FormArray([]),
    });
  }

  generateCustomForm() {
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

  onTouched = () => {};

  ngOnDestroy(): void {
    this.onChangeSub.unsubscribe();
  }

  ngOnChanges() {
    if (this.customFieldsForm?.controls) {
      this.generateCustomForm();
    }

    console.log('dependentFieldCustomInputs', this.customInputs);
    console.log('combinedCustomProperties', this.combinedCustomProperties);
  }

  writeValue(value: any) {
    if (value) {
      this.customFieldsForm.controls.fields.patchValue(value);
    }
  }

  registerOnChange(onChange): void {
    this.onChangeSub = this.customFieldsForm.valueChanges.subscribe(onChange);
  }

  registerOnTouched(onTouched): void {
    this.onTouched = onTouched;
  }
}
