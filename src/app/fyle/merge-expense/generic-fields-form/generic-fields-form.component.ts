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

type option = Partial<{ label: string; value: any }>;
type optionsData = Partial<{ options: option[]; areSameValues: boolean }>;

@Component({
  selector: 'app-generic-fields-form',
  templateUrl: './generic-fields-form.component.html',
  styleUrls: ['./generic-fields-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: GenericFieldsFormComponent,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: GenericFieldsFormComponent,
      multi: true,
    },
  ],
})
export class GenericFieldsFormComponent implements OnInit {
  // export class GenericFieldsFormComponent implements OnInit, ControlValueAccessor, OnDestroy {
  @Input() amountOptionsData$: optionsData;

  @Input() receiptOptions$: option[];

  @Input() dateOfSpendOptionsData$: optionsData;

  @Input() paymentModeOptionsData$: optionsData;

  @Input() attachments$: optionsData;

  @Input() projectOptionsData$: optionsData;

  @Input() billableOptionsData$: optionsData;

  @Input() categoryOptionsData$: optionsData;

  @Input() vendorOptionsData$: optionsData;

  @Input() genericFieldsFormGroup: FormGroup;

  form: FormGroup;

  onChangeSub: Subscription;

  subscriptions: Subscription[] = [];

  get value() {
    return this.form.value;
  }

  // set value(value) {
  //   this.form.setValue(value);
  //   this.onChange(value);
  //   this.onTouched();
  // }

  constructor(private formBuilder: FormBuilder) {
    // this.subscriptions.push(
    //   this.form.valueChanges.subscribe((value) => {
    //     this.onChange(value);
    //     this.onTouched();
    //   })
    // );
  }

  ngOnInit() {}

  // createGroup() {
  //   this.genericFieldsFormGroup = this.formBuilder.group({
  //     amount: [],
  //     receipt_ids: [],
  //     dateOfSpend: [],
  //   });
  //   return this.genericFieldsFormGroup;
  // }

  // ngOnDestroy() {
  //   this.subscriptions.forEach((s) => s.unsubscribe());
  // }

  // onChange: any = () => {};

  // onTouched: any = () => {};

  // registerOnChange(fn) {
  //   this.onChange = fn;
  // }

  // writeValue(value) {
  //   if (value) {
  //     this.value = value;
  //   }

  //   if (value === null) {
  //     this.form.reset();
  //   }
  // }

  // registerOnTouched(fn) {
  //   this.onTouched = fn;
  // }

  // validate(_: FormControl) {
  //   return this.form.valid ? null : { amount: { valid: false } };
  // }
}
