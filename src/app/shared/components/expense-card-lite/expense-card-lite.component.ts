import { Component, Input, OnInit } from '@angular/core';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { DatePipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { CurrencySymbolPipe } from '../../pipes/currency-symbol.pipe';
import { ExactCurrencyPipe } from '../../pipes/exact-currency.pipe';
import { IonIcon } from '@ionic/angular/standalone';


@Component({
  selector: 'app-expense-card-lite',
  templateUrl: './expense-card-lite.component.html',
  styleUrls: ['./expense-card-lite.component.scss'],
  imports: [
    CurrencySymbolPipe,
    DatePipe,
    ExactCurrencyPipe,
    IonIcon,
    TranslocoPipe
  ],
})
export class ExpenseCardLiteComponent implements OnInit {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() expense: Expense;

  isReceiptPresent: boolean;

  ngOnInit(): void {
    this.getReceipt();
  }

  getReceipt(): void {
    this.isReceiptPresent = this.expense.file_ids?.length > 0;
  }
}
