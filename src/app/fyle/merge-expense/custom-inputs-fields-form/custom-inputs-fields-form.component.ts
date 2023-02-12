import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { EventEmitter, Injector, Output, TemplateRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  FormControl,
  FormGroup,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormBuilder,
  Validators,
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

type CustomInputs = Partial<{
  control: AbstractControl;
  id: string;
  mandatory: boolean;
  name: string;
  options: Option[];
  placeholder: string;
  prefix: string;
  type: string;
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
  @Input() customInputs: CustomInputs[];

  @Input() combinedCustomProperties: CombinedOptions;

  @Input() disableFormElements: boolean;

  onChangeSub: Subscription;

  customFieldsForm: FormGroup;

  customFields: CustomInputs[];

  constructor(private formBuilder: FormBuilder, private injector: Injector) {}

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
