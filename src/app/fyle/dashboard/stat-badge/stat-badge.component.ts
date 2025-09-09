import { Component, Input, output } from '@angular/core';
import { ReportStates } from './report-states.enum';
import { MatRipple } from '@angular/material/core';
import { IonicModule } from '@ionic/angular';
import { NgClass } from '@angular/common';
import { HumanizeCurrencyPipe } from '../../../shared/pipes/humanize-currency.pipe';
import { ExactCurrencyPipe } from '../../../shared/pipes/exact-currency.pipe';

@Component({
    selector: 'app-stat-badge',
    templateUrl: './stat-badge.component.html',
    styleUrls: ['./stat-badge.component.scss'],
    imports: [
        MatRipple,
        IonicModule,
        NgClass,
        HumanizeCurrencyPipe,
        ExactCurrencyPipe,
    ],
})
export class StatBadgeComponent {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() reportState: ReportStates;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() name: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() count = 0;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() value = 0;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() currency: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() currencySymbol: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() loading = false;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() expenseState: string;

  readonly badgeClicked = output<ReportStates | string>();

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
