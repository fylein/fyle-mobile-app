import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ModalController, PopoverController} from '@ionic/angular';

@Component({
  selector: 'app-corporate-card-expenses-search-filter',
  templateUrl: './corporate-card-expenses-search-filter.component.html',
  styleUrls: ['./corporate-card-expenses-search-filter.component.scss'],
})
export class CorporateCardExpensesSearchFilterComponent implements OnInit {
  @Input() filters: Partial<{
    date: string;
    customDateStart: Date;
    customDateEnd: Date;
    sortParam: string;
    sortDir: string;
  }>;

  fg: FormGroup;

  constructor(
    private fb: FormBuilder,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    this.fg = this.fb.group({
      date: [this.filters && this.filters.date],
      customDateStart: [this.filters && this.filters.customDateStart],
      customDateEnd: [this.filters && this.filters.customDateEnd]
    });

    this.fg.validator = this.customDatevalidator;
  }

  customDatevalidator(formGroup: FormGroup) {
    if (formGroup.value.date &&
      formGroup.value.date === 'CUSTOMDATE' &&
      (formGroup.controls.customDateStart.value === null ||
        formGroup.controls.customDateEnd.value === null)) {
      return {
        error: 'custom date input is required when custom dates are selected'
      };
    }
  }

  save() {
    if (this.fg.value.date !== 'CUSTOMDATE') {
      this.fg.controls.customDateStart.reset();
      this.fg.controls.customDateEnd.reset();
    }

    this.popoverController.dismiss({
      filters: this.fg.value
    });
  }

  cancel() {
    this.popoverController.dismiss();
  }

  clearAll() {
    this.fg.reset();
  }
}
