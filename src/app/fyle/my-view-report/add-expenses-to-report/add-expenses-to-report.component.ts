import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { Router } from '@angular/router';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';

@Component({
  selector: 'app-add-expenses-to-report',
  templateUrl: './add-expenses-to-report.component.html',
  styleUrls: ['./add-expenses-to-report.component.scss'],
})
export class AddExpensesToReportComponent implements OnInit {
  @Input() unreportedExpenses: Expense[];

  @Input() reportId: string;

  homeCurrency$: Observable<string>;

  selectedTotalAmount = 0;

  selectedTotalExpenses = 0;

  selectedExpenseIds: string[];

  selectedElements: Expense[];

  isSelectedAll: boolean;

  homeCurrency: string;

  constructor(
    private modalController: ModalController,
    private currencyService: CurrencyService,
    private router: Router
  ) {}

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
