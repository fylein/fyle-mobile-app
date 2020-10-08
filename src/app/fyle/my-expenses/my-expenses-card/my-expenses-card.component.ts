import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-my-expenses-card',
  templateUrl: './my-expenses-card.component.html',
  styleUrls: ['./my-expenses-card.component.scss'],
})
export class MyExpensesCardComponent implements OnInit {

  @Input() expense: any;
  @Input() isSelectMode = false;
  @Input() disabledSelection = false;
  @Input() openReportsPresent = false;
  @Input() prevExpense;
  @Input() dateComparatorProp;
  showDt = true;
  vendorDetails = '';
  amountIsNumber;
  extractedAmountIsNumber;

  constructor() { }

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
    this.vendorDetails = this.getVendorDetails(this.expense);

    if (this.prevExpense && this.dateComparatorProp) {
      const currentDate = (this.expense && (new Date(this.expense[this.dateComparatorProp])).toDateString());
      const previousDate = (this.prevExpense && (new Date(this.prevExpense[this.dateComparatorProp])).toDateString());
      this.showDt = currentDate !== previousDate;
    }
  }

  goToTransaction() {

  }

  toggleFlashMode() {

  }

  addTransactionToReport() {

  }

  selectTransaction() {

  }

  deleteTransaction() {

  }

  addTransactionToNewReport() {

  }
}
