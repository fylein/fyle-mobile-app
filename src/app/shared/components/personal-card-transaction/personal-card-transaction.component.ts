import { getCurrencySymbol, NgClass } from '@angular/common';
import { Component, Input, OnInit, input, output } from '@angular/core';
import { PlatformPersonalCardTxn } from 'src/app/core/models/platform/platform-personal-card-txn.model';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { IonicModule } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { ExactCurrencyPipe } from '../../pipes/exact-currency.pipe';

@Component({
    selector: 'app-personal-card-transaction',
    templateUrl: './personal-card-transaction.component.html',
    styleUrls: ['./personal-card-transaction.component.scss'],
    imports: [
        MatCheckbox,
        MatIcon,
        NgClass,
        IonicModule,
        TranslocoPipe,
        DateFormatPipe,
        ExactCurrencyPipe,
    ],
})
export class PersonalCardTransactionComponent implements OnInit {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() transaction: PlatformPersonalCardTxn;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() previousTxnDate: Date;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() status;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() isSelectionModeEnabled: boolean;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() selectedElements: string[];

  readonly isMatchedCountLoading = input<boolean>(undefined);

  readonly setMultiselectMode = output<string>();

  readonly cardClickedForSelection = output<string>();

  showDt = true;

  currency: string;

  selectAll = false;

  get isSelected(): boolean {
    return this.selectedElements.some((txn) => this.transaction.id === txn);
  }

  ngOnInit(): void {
    this.currency = getCurrencySymbol(this.transaction.currency, 'wide');
    const currentDate = new Date(this.transaction.spent_at).toDateString();
    const previousDate = new Date(this.previousTxnDate).toDateString();
    this.showDt = currentDate !== previousDate;
  }

  onSetMultiselectMode(): void {
    if (!this.isSelectionModeEnabled) {
      this.setMultiselectMode.emit(this.transaction.id);
    }
  }

  onTapTransaction(): void {
    if (this.isSelectionModeEnabled) {
      this.cardClickedForSelection.emit(this.transaction.id);
    }
  }
}
