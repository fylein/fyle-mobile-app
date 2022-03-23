import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { CorporateCardExpense } from 'src/app/core/models/v2/corporate-card-expense.model';
import { Option } from 'src/app/core/models/option.type';
import { OptionsData } from 'src/app/core/models/options-data.type';

@Component({
  selector: 'app-generic-fields-form',
  templateUrl: './generic-fields-form.component.html',
  styleUrls: ['./generic-fields-form.component.scss'],
})
export class GenericFieldsFormComponent implements OnInit {
  @Input() amountOptionsData$: Observable<OptionsData>;

  @Input() receiptOptions$: Observable<Option[]>;

  @Input() dateOfSpendOptionsData$: Observable<OptionsData>;

  @Input() paymentModeOptionsData$: Observable<OptionsData>;

  @Input() attachments$: Observable<OptionsData>;

  @Input() projectOptionsData$: Observable<OptionsData>;

  @Input() billableOptionsData$: Observable<OptionsData>;

  @Input() categoryOptionsData$: Observable<OptionsData>;

  @Input() vendorOptionsData$: Observable<OptionsData>;

  @Input() taxGroupOptionsData$: Observable<OptionsData>;

  @Input() taxAmountOptionsData$: Observable<OptionsData>;

  @Input() constCenterOptionsData$: Observable<OptionsData>;

  @Input() purposeOptionsData$: Observable<OptionsData>;

  @Input() genericFieldsFormGroup: FormGroup;

  @Input() categoryDependentFormGroup: FormGroup;

  @Input() categoryDependentTemplate: TemplateRef<any>;

  @Input() CCCTxn$: Observable<CorporateCardExpense[]>;

  @Input() disableFormElements: boolean;

  constructor() {}

  ngOnInit() {}
}
