import { Component, Input, OnInit } from '@angular/core';
import { CustomInputs } from 'src/app/core/models/custom-input.type';
import { CombinedOptions } from 'src/app/core/models/combined-options.model';

@Component({
  selector: 'app-custom-inputs-fields-form',
  templateUrl: './custom-inputs-fields-form.component.html',
  styleUrls: ['./custom-inputs-fields-form.component.scss'],
})
export class CustomInputsFieldsFormComponent implements OnInit {
  @Input() customInputs$: CustomInputs[];

  @Input() combinedCustomProperties: CombinedOptions;

  @Input() disableFormElements: boolean;

  constructor() {}

  ngOnInit() {}
}
