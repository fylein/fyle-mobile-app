import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Expense } from 'src/app/core/models/expense.model';
import { CurrencyService } from 'src/app/core/services/currency.service';

@Component({
  selector: 'app-add-expenses-to-report',
  templateUrl: './add-expenses-to-report.component.html',
  styleUrls: ['./add-expenses-to-report.component.scss'],
})
export class AddExpensesToReportComponent implements OnInit {

  @Input() unReportedEtxns: Expense[];
  homeCurrency$: Observable<string>;
  selectedTotalAmount: number = 0;
  selectedTotalTxns: number = 0;
  selectedTxnIds: string[];

  constructor(
    private modalController: ModalController,
    private currencyService: CurrencyService
  ) { }

  close() {
    this.modalController.dismiss();
  }

  addExpensestoReport() {
    this.modalController.dismiss({
      selectedTxnIds: this.selectedTxnIds
    });
  }

  toggleTransaction (etxn) {
    etxn.isSelected = !etxn.isSelected;
    let etxns = this.unReportedEtxns.filter(etxn => etxn.isSelected);
    this.selectedTxnIds = etxns.map(etxn => etxn.tx_id);
    this.selectedTotalAmount = etxns.reduce(function (acc, obj) { return acc + obj.tx_amount; }, 0);
    this.selectedTotalTxns = this.selectedTxnIds.length;
  };

  ionViewWillEnter() {
    this.homeCurrency$ = this.currencyService.getHomeCurrency();
  }

  ngOnInit() {
  }

}
