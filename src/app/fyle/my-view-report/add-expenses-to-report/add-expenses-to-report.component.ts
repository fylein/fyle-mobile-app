import { Component, Input, OnInit, inject } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { Router } from '@angular/router';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { ExpensesCardComponent } from '../../../shared/components/expenses-card-v2/expenses-card.component';
import { ExactCurrencyPipe } from '../../../shared/pipes/exact-currency.pipe';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-add-expenses-to-report',
    templateUrl: './add-expenses-to-report.component.html',
    styleUrls: ['./add-expenses-to-report.component.scss'],
    imports: [
        IonicModule,
        MatIcon,
        MatCheckbox,
        FormsModule,
        ExpensesCardComponent,
        ExactCurrencyPipe,
        TranslocoPipe,
    ],
})
export class AddExpensesToReportComponent implements OnInit {
  private modalController = inject(ModalController);

  private currencyService = inject(CurrencyService);

  private router = inject(Router);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() unreportedExpenses: Expense[];

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() reportId: string;

  homeCurrency$: Observable<string>;

  selectedTotalAmount = 0;

  selectedTotalExpenses = 0;

  selectedExpenseIds: string[];

  selectedElements: Expense[];

  isSelectedAll: boolean;

  homeCurrency: string;

  close() {
    this.modalController.dismiss();
  }

  addExpensestoReport() {
    this.modalController.dismiss({
      selectedExpenseIds: this.selectedExpenseIds,
    });
  }

  updateSelectedExpenses() {
    this.selectedExpenseIds = this.selectedElements.map((expense) => expense.id);
    this.selectedTotalAmount = this.selectedElements.reduce((acc, expense) => {
      if (expense.is_reimbursable) {
        return acc + expense.amount;
      } else {
        return acc;
      }
    }, 0);
    this.selectedTotalExpenses = this.selectedExpenseIds.length;
  }

  toggleExpense(expense) {
    const isSelectedElementsIncludesExpense = this.selectedElements.some((element) => element.id === expense.id);
    if (isSelectedElementsIncludesExpense) {
      this.selectedElements = this.selectedElements.filter((element) => element.id !== expense.id);
    } else {
      this.selectedElements.push(expense);
    }
    this.updateSelectedExpenses();
    this.isSelectedAll = this.selectedElements.length === this.unreportedExpenses.length;
  }

  toggleSelectAll(value: boolean) {
    if (value) {
      this.selectedElements = this.unreportedExpenses;
      this.updateSelectedExpenses();
    } else {
      this.selectedElements = [];
      this.selectedTotalAmount = 0;
      this.selectedTotalExpenses = 0;
    }
  }

  ionViewWillEnter() {
    this.isSelectedAll = true;
    this.homeCurrency$ = this.currencyService.getHomeCurrency();
    const selectedExpenses = [];
    this.unreportedExpenses.forEach((expense, i) => {
      selectedExpenses.push(this.unreportedExpenses[i]);
    });
    this.selectedElements = selectedExpenses;
    this.updateSelectedExpenses();
  }

  addNewExpense() {
    this.router.navigate([
      '/',
      'enterprise',
      'add_edit_expense',
      { rp_id: this.reportId, remove_from_report: false, navigate_back: true },
    ]);
    this.modalController.dismiss();
  }

  ngOnInit() {
    this.currencyService.getHomeCurrency().subscribe((homeCurrency) => {
      this.homeCurrency = homeCurrency;
    });
  }
}
