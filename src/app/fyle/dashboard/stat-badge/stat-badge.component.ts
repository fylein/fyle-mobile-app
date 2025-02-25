import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReportStates } from './report-states.enum';

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

  // To track if the screen is small (370px or below)
  isSmallScreen = window.innerWidth <= 370;

  onBadgeClicked(): void {
    if (!this.loading) {
      this.badgeClicked.emit(this.reportState);
      if (this.expenseState) {
        this.badgeClicked.emit(this.expenseState);
      }
    }
  }
}
