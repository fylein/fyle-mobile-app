import { getCurrencySymbol } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-personal-card-transaction',
  templateUrl: './personal-card-transaction.component.html',
  styleUrls: ['./personal-card-transaction.component.scss'],
})
export class PersonalCardTransactionComponent implements OnInit {
  @Input() txnId;

  @Input() description;

  @Input() amount;

  @Input() currency;

  @Input() type;

  @Input() txnDate;

  @Input() previousTxnDate;

  @Input() status;

  @Input() isSelectionModeEnabled: boolean;

  @Input() selectedElements: string[];

  @Output() setMultiselectMode: EventEmitter<string> = new EventEmitter();

  @Output() cardClickedForSelection: EventEmitter<string> = new EventEmitter();

  showDt = true;

  selectAll = false;

  constructor() {}

  ngOnInit(): void {
    this.currency = getCurrencySymbol(this.currency, 'wide');
    const currentDate = new Date(this.txnDate).toDateString();
    const previousDate = new Date(this.previousTxnDate).toDateString();
    this.showDt = currentDate !== previousDate;
  }

  get isSelected() {
    return this.selectedElements.some((txn) => this.txnId === txn);
  }

  onSetMultiselectMode() {
    if (!this.isSelectionModeEnabled) {
      this.setMultiselectMode.emit(this.txnId);
    }
  }

  onTapTransaction() {
    if (this.isSelectionModeEnabled) {
      this.cardClickedForSelection.emit(this.txnId);
    }
  }
}
