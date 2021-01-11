import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {ModalController, PopoverController} from '@ionic/angular';

@Component({
  selector: 'app-team-reports-sort-filter',
  templateUrl: './team-reports-sort-filter.component.html',
  styleUrls: ['./team-reports-sort-filter.component.scss'],
})
export class TeamReportsSortFilterComponent implements OnInit {

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
        this.filters && this.filters.sortParam || 'rp_created_at', Validators.required
      ],
      sortDir: [
        this.filters && this.filters.sortDir || 'desc', Validators.required
      ]
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

  reset() {
    this.fg.setValue({
      sortParam: 'rp_created_at',
      sortDir: 'desc'
    });
  }
}
