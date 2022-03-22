import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';

type Option = Partial<{ label: string; value: any }>;
type OptionsData = Partial<{ options: Option[]; areSameValues: boolean }>;
type CustomInputs = Partial<{
  control: FormControl;
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
})
export class CustomInputsFieldsFormComponent implements OnInit {
  @Input() customInputs$: CustomInputs[];

  @Input() combinedCustomProperties: CombinedOptions;

  @Input() disableFormElements: boolean;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {}
}
