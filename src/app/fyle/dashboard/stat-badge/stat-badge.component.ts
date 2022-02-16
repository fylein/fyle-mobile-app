import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ReportStates } from './report-states';
import { getCurrencySymbol } from '@angular/common';

@Component({
  selector: 'app-stat-badge',
  templateUrl: './stat-badge.component.html',
  styleUrls: ['./stat-badge.component.scss'],
})
export class StatBadgeComponent implements OnInit {
  @Input() reportState: ReportStates;

  @Input() name: string;

  @Input() count = 0;

  @Input() value = 0;

  @Input() currency: string;

  @Input() loading = false;

  @Input() expenseState: string;

  @Output() badgeClicked = new EventEmitter();

  currencySymbol = '';

  constructor() {}

  ngOnInit() {
    this.currencySymbol = getCurrencySymbol(this.currency, 'wide');
  }

  onBadgeClicked() {
    if (!this.loading) {
      this.badgeClicked.emit(this.reportState);
      if (this.expenseState) {
        this.badgeClicked.emit(this.expenseState);
      }
    }
  }
}
