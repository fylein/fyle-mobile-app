import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddEditExpensePageRoutingModule } from './add-edit-expense-routing.module';

import { AddEditExpensePage } from './add-edit-expense.page';
import { MatIconModule } from '@angular/material/icon';
import { FyCurrencyChooseCurrencyComponent } from './fy-currency/fy-currency-choose-currency/fy-currency-choose-currency.component';
import { FyCurrencyExchangeRateComponent } from './fy-currency/fy-currency-exchange-rate/fy-currency-exchange-rate.component';
import { FyCurrencyComponent } from './fy-currency/fy-currency.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PolicyViolationComponent } from './policy-violation/policy-violation.component';
import { CameraOptionsPopupComponent } from './camera-options-popup/camera-options-popup.component';
import { PinchZoomModule } from 'ngx-pinch-zoom';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MatchTransactionComponent } from './match-transaction/match-transaction.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatIconModule,
    AddEditExpensePageRoutingModule,
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
  declarations: [
    AddEditExpensePage,
    FyCurrencyComponent,
    FyCurrencyChooseCurrencyComponent,
    FyCurrencyExchangeRateComponent,
    PolicyViolationComponent,
    CameraOptionsPopupComponent,
    MatchTransactionComponent,
  ],
})
export class AddEditExpensePageModule {}
