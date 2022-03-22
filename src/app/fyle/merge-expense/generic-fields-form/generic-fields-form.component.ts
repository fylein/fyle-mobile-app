import {
  Component,
  DoCheck,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
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
import { Observable, Subscription } from 'rxjs';
import { CorporateCardExpense } from 'src/app/core/models/v2/corporate-card-expense.model';

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
  @Input() amountOptionsData$: Observable<optionsData>;

  @Input() receiptOptions$: Observable<option[]>;

  @Input() dateOfSpendOptionsData$: Observable<optionsData>;

  @Input() paymentModeOptionsData$: Observable<optionsData>;

  @Input() attachments$: Observable<optionsData>;

  @Input() projectOptionsData$: Observable<optionsData>;

  @Input() billableOptionsData$: Observable<optionsData>;

  @Input() categoryOptionsData$: Observable<optionsData>;

  @Input() vendorOptionsData$: Observable<optionsData>;

  @Input() taxGroupOptionsData$: Observable<optionsData>;

  @Input() taxAmountOptionsData$: Observable<optionsData>;

  @Input() constCenterOptionsData$: Observable<optionsData>;

  @Input() purposeOptionsData$: Observable<optionsData>;

  @Input() genericFieldsFormGroup: FormGroup;

  @Input() categoryDependentFormGroup: FormGroup;

  @Input() categoryDependentTemplate: TemplateRef<any>;

  @Input() CCCTxn$: Observable<CorporateCardExpense[]>;

  form: FormGroup;

  constructor() {}

  ngOnInit() {}
}
