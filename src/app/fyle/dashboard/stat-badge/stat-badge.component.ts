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

  screenWidth: number = window.innerWidth;

  // TODO: This approach based on screen size evaluation needs to be fixed
  get shouldDisplayExact(): boolean {
    if (this.screenWidth > 396) {
      // On larger screens, show exact value for 7-digit numbers or less
      return this.value >= -999999 && this.value <= 9999999;
    } else if (this.screenWidth > 370) {
      // On medium screens (between 371px and 396px), show exact value for 6-digit numbers or less
      return this.value >= -99999 && this.value <= 999999;
    } else {
      // On small screens, always use humanized format
      return false;
    }
  }

  onBadgeClicked(): void {
    if (!this.loading) {
      this.badgeClicked.emit(this.reportState);
      if (this.expenseState) {
        this.badgeClicked.emit(this.expenseState);
      }
    }
  }
}
