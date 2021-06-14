import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Expense } from 'src/app/core/models/expense.model';
import { ExpenseField } from 'src/app/core/models/v1/expense-field.model';
import { ExpenseFieldsMap } from 'src/app/core/models/v1/expense-fields-map.model';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { TransactionService } from 'src/app/core/services/transaction.service';

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

  constructor(
    private transactionService: TransactionService,
    private expenseFieldsService: ExpenseFieldsService
  ) { }

  ngOnInit() {
    this.expense.vendorDetails = this.transactionService.getVendorDetails(this.expense);
    this.expenseFields$ = this.expenseFieldsService.getAllMap();
    this.isPolicyViolated = (this.expense.tx_manual_flag || this.expense.tx_policy_flag);
    this.isCriticalPolicyViolated = (typeof this.expense.tx_policy_amount === 'number' && this.expense.tx_policy_amount < 0.0001);

    if (this.previousExpenseTxnDate) {
      const currentDate = (this.expense && (new Date(this.expense.tx_txn_dt)).toDateString());
      const previousDate = (this.previousExpenseTxnDate && (new Date(this.previousExpenseTxnDate)).toDateString());
      this.showDt = currentDate !== previousDate;
    }

    if (this.expense.tx_fyle_category.toLowerCase() === 'mileage') {
      this.receipt = 'assets/svg/fy-mileage.svg';
    } else if ((this.expense.tx_fyle_category.toLowerCase() === 'per diem')) {
      this.receipt = 'assets/svg/fy-calendar.svg';
    } else {
      this.receipt = 'assets/svg/fy-expense.svg';
    }

    // this.expenseFields$.subscribe((res) => {
    //   debugger;
    // })
  }

}
