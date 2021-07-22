import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Expense} from '../../../core/models/expense.model';
import {Observable} from 'rxjs';
import {ReportService} from '../../../core/services/report.service';
import {map} from 'rxjs/operators';
import {CorporateCardExpense} from '../../../core/models/v2/corporate-card-expense.model';

@Component({
    selector: 'app-corporate-card-expense-card',
    templateUrl: './corporate-card-expense-card.component.html',
    styleUrls: ['./corporate-card-expense-card.component.scss'],
})
export class CorporateCardExpenseCardComponent implements OnInit {
  @Input() corporateCardExpense: CorporateCardExpense;
  @Input() prevExpense;
  @Input() dateComparatorProp;
  @Input() skipDate = false;
  @Input() baseState;

  @Output() goToTransaction: EventEmitter<any> = new EventEmitter<any>();

  showDt = true;

  constructor(
  ) { }

  ngOnInit() {
      if (this.prevExpense && this.dateComparatorProp) {
          const currentDate = (this.corporateCardExpense && (new Date(this.corporateCardExpense[this.dateComparatorProp])).toDateString());
          const previousDate = (this.prevExpense && (new Date(this.prevExpense[this.dateComparatorProp])).toDateString());
          this.showDt = currentDate !== previousDate;
      }
  }

  onGoToTransaction() {
      this.goToTransaction.emit(this.corporateCardExpense);
  }

}
