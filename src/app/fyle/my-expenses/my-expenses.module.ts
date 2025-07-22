import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MyExpensesPageRoutingModule } from './my-expenses-routing.module';
import { MyExpensesPage } from './my-expenses.page';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddTxnToReportDialogComponent } from './add-txn-to-report-dialog/add-txn-to-report-dialog.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DismissDialogComponent } from '../dashboard/tasks/dismiss-dialog/dismiss-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyExpensesPageRoutingModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
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
    MyExpensesPage,
    AddTxnToReportDialogComponent,
    DismissDialogComponent,
  ],
})
export class MyExpensesPageModule {}
