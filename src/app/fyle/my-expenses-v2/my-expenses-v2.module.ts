import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MyExpensesV2PageRoutingModule } from './my-expenses-routing.module';
import { MyExpensesV2Page } from './my-expenses-v2.page';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddExpensePopoverComponent } from './add-expense-popover/add-expense-popover.component';
import { AddTxnToReportDialogComponent } from './add-txn-to-report-dialog/add-txn-to-report-dialog.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyExpensesV2PageRoutingModule,
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
    SharedModule,
    MatCheckboxModule,
  ],
  declarations: [MyExpensesV2Page, AddExpensePopoverComponent, AddTxnToReportDialogComponent],
})
export class MyExpensesV2PageModule {}
