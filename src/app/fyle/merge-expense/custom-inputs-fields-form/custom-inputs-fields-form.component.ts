import { Component, DoCheck, Injector, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  NgControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-custom-inputs-fields-form',
  templateUrl: './custom-inputs-fields-form.component.html',
  styleUrls: ['./custom-inputs-fields-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: CustomInputsFieldsFormComponent,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: CustomInputsFieldsFormComponent,
      multi: true,
    },
  ],
})
export class CustomInputsFieldsFormComponent implements OnInit {
  @Input() customInputs$: any;

  @Input() combinedCustomProperties: any;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {}
}
