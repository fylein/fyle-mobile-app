import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Expense } from 'src/app/core/models/expense.model';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { getCurrencySymbol } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-expenses-to-report',
  templateUrl: './add-expenses-to-report.component.html',
  styleUrls: ['./add-expenses-to-report.component.scss'],
})
export class AddExpensesToReportComponent implements OnInit {
  @Input() unReportedEtxns: Expense[];

  @Input() reportId: string;

  homeCurrency$: Observable<string>;

  selectedTotalAmount = 0;

  selectedTotalTxns = 0;

  selectedTxnIds: string[];

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
      selectedTxnIds: this.selectedTxnIds,
      selectedTotalAmount: this.selectedTotalAmount,
      selectedTotalTxns: this.selectedTotalTxns,
    });
  }

  updateSelectedTxns() {
    this.selectedTxnIds = this.selectedElements.map((etxn) => etxn.tx_id);
    this.selectedTotalAmount = this.selectedElements.reduce((acc, obj) => {
      if (!obj.tx_skip_reimbursement) {
        return acc + obj.tx_amount;
      } else {
        return acc;
      }
    }, 0);
    this.selectedTotalTxns = this.selectedTxnIds.length;
  }

  toggleTransaction(etxn) {
    const isSelectedElementsIncludesExpense = this.selectedElements.some((txn) => etxn.tx_id === txn.tx_id);
    if (isSelectedElementsIncludesExpense) {
      this.selectedElements = this.selectedElements.filter((txn) => txn.tx_id !== etxn.tx_id);
    } else {
      this.selectedElements.push(etxn);
    }
    this.updateSelectedTxns();
    this.isSelectedAll = this.selectedElements.length === this.unReportedEtxns.length;
  }

  toggleSelectAll(value: boolean) {
    if (value) {
      this.selectedElements = this.unReportedEtxns;
      this.updateSelectedTxns();
    } else {
      this.selectedElements = [];
      this.selectedTotalAmount = 0;
      this.selectedTotalTxns = 0;
    }
  }

  ionViewWillEnter() {
    this.isSelectedAll = true;
    this.homeCurrency$ = this.currencyService.getHomeCurrency();
    const selectedTxns = [];
    this.unReportedEtxns.forEach((etxn, i) => {
      this.unReportedEtxns[i].isSelected = true;
      selectedTxns.push(this.unReportedEtxns[i]);
    });
    this.selectedElements = selectedTxns;
    this.updateSelectedTxns();
  }

  addNewExpense() {
    this.router.navigate(['/', 'enterprise', 'add_edit_expense', { rp_id: this.reportId }]);
    this.modalController.dismiss();
  }

  ngOnInit() {
    this.currencyService.getHomeCurrency().subscribe((homeCurrency) => {
      this.homeCurrency = homeCurrency;
    });
  }
}
