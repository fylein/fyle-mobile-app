import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MergeExpensePageRoutingModule } from './merge-expense-routing.module';

import { MergeExpensePage } from './merge-expense.page';

import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PinchZoomModule } from 'ngx-pinch-zoom';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CardTransactionPreviewComponent } from './card-transaction-preview/card-transaction-preview.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MergeExpensePageRoutingModule,
    ReactiveFormsModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    SharedModule,
    PinchZoomModule,
    PdfViewerModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  declarations: [MergeExpensePage, CardTransactionPreviewComponent],
})
export class MergeExpensePageModule {}
