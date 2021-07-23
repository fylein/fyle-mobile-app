import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {PopoverController} from '@ionic/angular';

@Component({
  selector: 'app-my-expenses-sort-filter',
  templateUrl: './my-expenses-sort-filter.component.html',
  styleUrls: ['./my-expenses-sort-filter.component.scss'],
})
export class MyExpensesSortFilterComponent implements OnInit {
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
      sortParam: [
        this.filters && this.filters.sortParam || 'tx_txn_dt', Validators.required
      ],
      sortDir: [
        this.filters && this.filters.sortDir || 'desc', Validators.required
      ]
    });
  }

  reset() {
    this.fg.setValue({
      sortParam: 'tx_txn_dt',
      sortDir: 'desc'
    });
  }

  save() {
    this.popoverController.dismiss({
      sortOptions: this.fg.value
    });
  }

  cancel() {
    this.popoverController.dismiss();
  }

  clearAll() {
    this.fg.reset();
  }
}
