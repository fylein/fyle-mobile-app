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
import { FySelectComponent } from './fy-select/fy-select.component';
import { FySelectModalComponent } from './fy-select/fy-select-modal/fy-select-modal.component';
import { MatRippleModule } from '@angular/material/core';


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
    MatRippleModule
  ],
  declarations: [
    AddEditExpensePage,
    FyCurrencyComponent,
    FyCurrencyChooseCurrencyComponent,
    FyCurrencyExchangeRateComponent,
    FySelectComponent,
    FySelectModalComponent
  ]
})
export class AddEditExpensePageModule { }
