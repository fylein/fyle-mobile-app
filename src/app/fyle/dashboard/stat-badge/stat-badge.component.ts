import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReportStates } from './report-states';

@Component({
  selector: 'app-stat-badge',
  templateUrl: './stat-badge.component.html',
  styleUrls: ['./stat-badge.component.scss'],
})
export class StatBadgeComponent {
  @Input() reportState: ReportStates;

  @Input() name: string;

  @Input() count = 0;

  @Input() value = 0;

  @Input() currency: string;

  @Input() currencySymbol: string;

  @Input() loading = false;

  @Input() expenseState: string;

  @Output() badgeClicked = new EventEmitter();

  onBadgeClicked() {
    if (!this.loading) {
      this.badgeClicked.emit(this.reportState);
      if (this.expenseState) {
        this.badgeClicked.emit(this.expenseState);
      }
    }
  }
}
