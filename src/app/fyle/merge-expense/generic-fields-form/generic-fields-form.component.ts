import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { CorporateCardExpense } from 'src/app/core/models/v2/corporate-card-expense.model';

type option = Partial<{ label: string; value: any }>;
type optionsData = Partial<{ options: option[]; areSameValues: boolean }>;

@Component({
  selector: 'app-generic-fields-form',
  templateUrl: './generic-fields-form.component.html',
  styleUrls: ['./generic-fields-form.component.scss'],
})
export class GenericFieldsFormComponent implements OnInit {
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

  @Input() disableFormElements: boolean;

  constructor() {}

  ngOnInit() {}
}
