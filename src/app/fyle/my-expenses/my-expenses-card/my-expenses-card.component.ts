import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Expense } from 'src/app/core/models/expense.model';
import {noop, Observable} from 'rxjs';
import { ReportService } from 'src/app/core/services/report.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-my-expenses-card',
  templateUrl: './my-expenses-card.component.html',
  styleUrls: ['./my-expenses-card.component.scss'],
})
export class MyExpensesCardComponent implements OnInit {

  @Input() expense: Expense;
  @Input() disabledSelection = false;
  @Input() prevExpense;
  @Input() dateComparatorProp;
  @Input() canDelete = false;
  @Input() skipDate = false;
  @Input() selectionMode = false;
  @Input() selectedElements = [];
  @Input() baseState;
  @Input() canOpenCard = true;
  @Input() isSyncInProgress: boolean;

  @Output() goToTransaction: EventEmitter<Expense> = new EventEmitter();
  @Output() toggleFlashMode: EventEmitter<Expense> = new EventEmitter();
  @Output() addTransactionToReport: EventEmitter<Expense> = new EventEmitter();
  @Output() addTransactionToNewReport: EventEmitter<Expense> = new EventEmitter();
  @Output() selectTransaction: EventEmitter<Expense> = new EventEmitter();
  @Output() deleteTransaction: EventEmitter<Expense> = new EventEmitter();
  @Output() cardClickedForSelection: EventEmitter<Expense> = new EventEmitter();

  showDt = true;
  vendorDetails = '';
  amountIsNumber;
  extractedAmountIsNumber;
  isPolicyViolated = false;
  isCriticalPolicyViolated = false;
  isDraft = false;
  actionOpened = false;
  addToReportPossible$: Observable<boolean>;

  constructor(
    private reportService: ReportService
  ) { }

  get isSelected() {
    return this.selectedElements.includes(this.expense.tx_id);
  }

  getVendorDetails(expense) {
    const category = expense.tx_org_category && expense.tx_org_category.toLowerCase();
    let vendorName = expense.tx_vendor || 'Expense';

    if (category === 'mileage') {
      vendorName = expense.tx_distance;
      vendorName += ' ' + expense.tx_distance_unit;
    } else if (category === 'per diem') {
      vendorName = expense.tx_num_days;
      vendorName += ' Days';
    }

    return vendorName;
  }

  ngOnInit() {
    this.amountIsNumber = typeof this.expense.tx_amount === 'number';
    this.extractedAmountIsNumber = typeof (this.expense && this.expense.tx_extracted_data && this.expense.tx_extracted_data.amount) === 'number';
    this.isDraft = this.expense.tx_state === 'DRAFT';
    this.vendorDetails = this.getVendorDetails(this.expense);
    this.isPolicyViolated = (this.expense.tx_manual_flag || this.expense.tx_policy_flag);
    this.isCriticalPolicyViolated = (typeof this.expense.tx_policy_amount === 'number' && this.expense.tx_policy_amount < 0.0001);
    if (this.prevExpense && this.dateComparatorProp) {
      const currentDate = (this.expense && (new Date(this.expense[this.dateComparatorProp])).toDateString());
      const previousDate = (this.prevExpense && (new Date(this.prevExpense[this.dateComparatorProp])).toDateString());
      this.showDt = currentDate !== previousDate;
    }

    this.addToReportPossible$ = this.reportService.getAllOpenReportsCount().pipe(
      map(
        count => count > 0
      )
    );

    this.addToReportPossible$.subscribe(noop);
  }

  onGoToTransaction() {
    if (!this.selectionMode) {
      this.goToTransaction.emit(this.expense);
    } else {
      if ((!this.isDraft || this.baseState === 'draft') && !this.isCriticalPolicyViolated) {
        this.cardClickedForSelection.emit(this.expense);
      }
    }
  }

  onToggleFlashMode() {
    this.toggleFlashMode.emit(this.expense);
  }

  onAddTransactionToReport() {
    if (this.isDraft || this.isCriticalPolicyViolated) {
      return;
    }
    this.addToReportPossible$.subscribe(possible => {
      if (possible) {
        this.addTransactionToReport.emit(this.expense);
      } else {
        this.addTransactionToNewReport.emit(this.expense);
      }
    });
  }

  onSelectTransaction() {
    this.selectTransaction.emit(this.expense);
  }

  onDeleteTransaction() {
    this.deleteTransaction.emit(this.expense);
  }
}
