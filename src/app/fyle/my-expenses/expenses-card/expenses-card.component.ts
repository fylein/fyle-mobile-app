import { Component, Input, OnInit } from '@angular/core';
import { noop, Observable } from 'rxjs';
import { Expense } from 'src/app/core/models/expense.model';
import { ExpenseField } from 'src/app/core/models/v1/expense-field.model';
import { ExpenseFieldsMap } from 'src/app/core/models/v1/expense-fields-map.model';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import {getCurrencySymbol} from '@angular/common';
import { OfflineService } from 'src/app/core/services/offline.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-expenses-card',
  templateUrl: './expenses-card.component.html',
  styleUrls: ['./expenses-card.component.scss'],
})
export class ExpensesCardComponent implements OnInit {

  @Input() expense: Expense;
  @Input() previousExpenseTxnDate;
  @Input() isSelectionModeEnabled: boolean;
  @Input() isSelected: boolean;
  @Input() isProjectMandatory: boolean;
  expenseFields$: Observable<Partial<ExpenseFieldsMap>>;
  receipt: any;
  showDt = true;
  isPolicyViolated: boolean;
  isCriticalPolicyViolated: boolean;
  currencySymbol = '';
  homeCurrency: string;
  icon: string;
  isScanInProgress: boolean;

  constructor(
    private transactionService: TransactionService,
    private expenseFieldsService: ExpenseFieldsService,
    private offlineService: OfflineService
  ) { }

  ngOnInit() {
    this.expense.vendorDetails = this.transactionService.getVendorDetails(this.expense);
    this.expenseFields$ = this.expenseFieldsService.getAllMap();
    this.isPolicyViolated = (this.expense.tx_manual_flag || this.expense.tx_policy_flag);
    this.isCriticalPolicyViolated = (typeof this.expense.tx_policy_amount === 'number' && this.expense.tx_policy_amount < 0.0001);
    this.offlineService.getHomeCurrency().pipe(
      map((homeCurrency) => {
        this.homeCurrency = homeCurrency;
        this.currencySymbol = getCurrencySymbol(homeCurrency, 'wide');
      })
    ).subscribe(noop);
    this.currencySymbol = getCurrencySymbol(this.expense.tx_currency, 'wide');

    if (this.previousExpenseTxnDate) {
      const currentDate = (this.expense && (new Date(this.expense.tx_txn_dt)).toDateString());
      const previousDate = (this.previousExpenseTxnDate && (new Date(this.previousExpenseTxnDate)).toDateString());
      this.showDt = currentDate !== previousDate;
    }

    this.isScanInProgress = this.getScanningReceiptCard(this.expense);

    if (this.expense.tx_fyle_category.toLowerCase() === 'mileage') {
      this.receipt = 'assets/svg/fy-mileage.svg';
    } else if ((this.expense.tx_fyle_category.toLowerCase() === 'per diem')) {
      this.receipt = 'assets/svg/fy-calendar.svg';
    } else {
      this.receipt = 'assets/svg/fy-expense.svg';
    }

    if (this.expense.source_account_type === "PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT") {
        if (this.expense.tx_corporate_credit_card_expense_group_id) {
          this.icon = 'fy-matched';
        } else {
          this.icon = 'fy-unmatched';
        }
    } else {
      if (!this.expense.tx_skip_reimbursement) {
        this.icon = 'fy-reimbursable';
      } else {
        this.icon = 'fy-non-reimbursable';
      }
    }

  

    // this.expenseFields$.subscribe((res) => {
    //   debugger;
    // })
  }
  getScanningReceiptCard(expense: Expense): boolean {
    if (expense.tx_fyle_category.toLowerCase() === 'mileage' || expense.tx_fyle_category.toLowerCase() === 'per diem') {
      return false;
    } else {
      if (!expense.tx_extracted_data && !expense.tx_transcribed_data) {
        return true;
      } else {
        return false;
      }
    }
  }

}
