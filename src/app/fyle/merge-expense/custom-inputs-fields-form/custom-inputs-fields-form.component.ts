import { Component, Input, OnChanges, OnDestroy, OnInit, inject, input } from '@angular/core';
import { Injector } from '@angular/core';
import { Subscription, noop } from 'rxjs';
import {
  UntypedFormGroup,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  UntypedFormBuilder,
  UntypedFormArray,
} from '@angular/forms';
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
  standalone: false,
})
export class CustomInputsFieldsFormComponent implements OnInit, ControlValueAccessor, OnDestroy, OnChanges {
  private formBuilder = inject(UntypedFormBuilder);

  private injector = inject(Injector);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() customInputs: CustomInputsField[];

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() combinedCustomProperties: CombinedOptions;

  readonly disableFormElements = input<boolean>(undefined);

  onChangeSub: Subscription;

  customFieldsForm: UntypedFormGroup;

  customFields: CustomInputsField[];

  onTouched: () => void = noop;

  ngOnInit(): void {
    this.customFieldsForm = this.formBuilder.group({
      fields: new UntypedFormArray([]),
    });
  }

  generateCustomForm(): void {
    const customFieldsFormArray = this.customFieldsForm?.controls?.fields as UntypedFormArray;
    customFieldsFormArray.clear();
    for (const customField of this.customInputs) {
      customFieldsFormArray.push(
        this.formBuilder.group({
          ...(customField.id && { id: [customField.id] }),
          name: [customField.name],
          value: [customField.value],
        }),
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

  writeValue(value: UntypedFormGroup): void {
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
