import { getCurrencySymbol } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PlatformPersonalCardTxn } from 'src/app/core/models/platform/platform-personal-card-txn.model';

@Component({
  selector: 'app-personal-card-transaction',
  templateUrl: './personal-card-transaction.component.html',
  styleUrls: ['./personal-card-transaction.component.scss'],
})
export class PersonalCardTransactionComponent implements OnInit {
  @Input() transaction: PlatformPersonalCardTxn;

  @Input() previousTxnDate: Date;

  @Input() status;

  @Input() isSelectionModeEnabled: boolean;

  @Input() selectedElements: string[];

  @Input() isMatchedCountLoading: boolean;

  @Output() setMultiselectMode = new EventEmitter<string>();

  @Output() cardClickedForSelection = new EventEmitter<string>();

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
