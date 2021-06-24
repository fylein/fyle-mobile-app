import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Expense } from 'src/app/core/models/expense.model';
import { ExpenseFieldsMap } from 'src/app/core/models/v1/expense-fields-map.model';
import { OfflineService } from 'src/app/core/services/offline.service';

@Component({
  selector: 'app-create-new-report',
  templateUrl: './create-new-report.component.html',
  styleUrls: ['./create-new-report.component.scss'],
})
export class CreateNewReportComponent implements OnInit {

  @Input() selectedExpensesToReport;
  expenseFields$: Observable<Partial<ExpenseFieldsMap>>;
  selectedElements: Expense[];


  constructor(
    private offlineService: OfflineService,
    private modalController: ModalController
  ) {
    
  }

  ngOnInit() {
    this.expenseFields$ = this.offlineService.getExpenseFieldsMap();
    this.selectedElements = this.selectedExpensesToReport;
  }

  selectExpense(expense: Expense) {
    const isSelectedElementsIncludesExpense = this.selectedElements.some(txn => expense.tx_id === txn.tx_id);
    if (isSelectedElementsIncludesExpense) {
      this.selectedElements = this.selectedElements.filter(txn => txn.tx_id !== expense.tx_id);
    } else {
      this.selectedElements.push(expense);
    }
  }

  toggleSelectAll(value) {
    if (value) {
      this.selectedElements =  this.selectedExpensesToReport;
    } else {
      this.selectedElements = [];
    }
  }

  closeEvent() {
    this.modalController.dismiss();
  }

  ctaClickedEvent(reportActionType) {
    this.modalController.dismiss({
      reportActionType,
      selectedExpense: this.selectedElements
    });

  }
}
