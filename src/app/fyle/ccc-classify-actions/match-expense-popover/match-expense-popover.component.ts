import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Expense } from '../../../core/models/expense.model';
import { TransactionService } from '../../../core/services/transaction.service';
import { PopoverController } from '@ionic/angular';
import { map, tap } from 'rxjs/operators';
import { CorporateCreditCardExpenseService } from '../../../core/services/corporate-credit-card-expense.service';
import { LoaderService } from '../../../core/services/loader.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-match-expense-popover',
  templateUrl: './match-expense-popover.component.html',
  styleUrls: ['./match-expense-popover.component.scss'],
})
export class MatchExpensePopoverComponent implements OnInit {
  @Input() expenseId: string;

  @Input() CCCEId: string;

  @Input() splitGroupId: string;

  matchedExpense$: Observable<Expense>;

  constructor(
    private transactionService: TransactionService,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private popoverController: PopoverController,
    private loaderService: LoaderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.matchedExpense$ = this.transactionService
      .getSplitExpenses(this.splitGroupId)
      .pipe(map((res) => res && res[0]));
  }

  closeMatchExpensePopover() {
    this.popoverController.dismiss();
  }

  async matchExpense() {
    await this.loaderService.showLoader();
    await this.transactionService.matchCCCExpense(this.expenseId, this.CCCEId).toPromise();
    await this.loaderService.hideLoader();
    await this.popoverController.dismiss();
    await this.router.navigate(['/', 'enterprise', 'corporate_card_expenses']);
  }
}
