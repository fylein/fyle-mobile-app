import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {MyExpensesPageRoutingModule} from './my-expenses-routing.module';
import {MyExpensesPage} from './my-expenses.page';
import {MyExpensesCardComponent} from './my-expenses-card/my-expenses-card.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatRadioModule} from '@angular/material/radio';
import {MatNativeDateModule, MatRippleModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatIconModule} from '@angular/material/icon';
import {SharedModule} from 'src/app/shared/shared.module';
import {MyExpensesSearchFilterComponent} from './my-expenses-search-filter/my-expenses-search-filter.component';
import {MyExpensesSortFilterComponent} from './my-expenses-sort-filter/my-expenses-sort-filter.component';
import {AddExpensePopoverComponent} from './add-expense-popover/add-expense-popover.component';
import {AddTxnToReportDialogComponent} from './add-txn-to-report-dialog/add-txn-to-report-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReportStates } from '../dashboard/stat-badge/report-states';
import { ExpensesAddedToReportToastMessageComponent } from './expenses-added-to-report-toast-message/expenses-added-to-report-toast-message.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import {MatSnackBarModule} from '@angular/material/snack-bar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyExpensesPageRoutingModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatRippleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatBottomSheetModule,
    MatSnackBarModule,
    SharedModule
  ],
  declarations: [
    MyExpensesPage,
    MyExpensesCardComponent,
    MyExpensesSearchFilterComponent,
    MyExpensesSortFilterComponent,
    AddExpensePopoverComponent,
    AddTxnToReportDialogComponent,
    ExpensesAddedToReportToastMessageComponent
  ]
})
export class MyExpensesPageModule { }
