import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import {ModalController, PopoverController} from '@ionic/angular';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/shared/format-datepicker/format-datepicker';

@Component({
  selector: 'app-team-reports-search-filter',
  templateUrl: './team-reports-search-filter.component.html',
  styleUrls: ['./team-reports-search-filter.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})
export class TeamReportsSearchFilterComponent implements OnInit {

  @Input() filters: Partial<{
    state: string;
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
      state: [this.filters && this.filters.state],
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
