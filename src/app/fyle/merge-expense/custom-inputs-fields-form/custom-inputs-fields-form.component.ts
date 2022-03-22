import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-custom-inputs-fields-form',
  templateUrl: './custom-inputs-fields-form.component.html',
  styleUrls: ['./custom-inputs-fields-form.component.scss'],
})
export class CustomInputsFieldsFormComponent implements OnInit {
  @Input() customInputs$: any;

  @Input() combinedCustomProperties: any;

  @Input() disableFormElements: boolean;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {}
}
