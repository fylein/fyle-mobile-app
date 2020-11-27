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
import { FySelectProjectComponent } from './fy-select-project/fy-select-project.component';
import { FySelectModalComponent } from './fy-select-project/fy-select-modal/fy-select-modal.component';
import { FySelectVendorComponent } from './fy-select-vendor/fy-select-vendor.component';
import { FySelectVendorModalComponent } from './fy-select-vendor/fy-select-modal/fy-select-vendor-modal.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SplitExpensePopoverComponent } from './split-expense-popover/split-expense-popover.component';
import { CriticalPolicyViolationComponent } from './critical-policy-violation/critical-policy-violation.component';
import { PolicyViolationComponent } from './policy-violation/policy-violation.component';


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
    SharedModule
  ],
  declarations: [
    AddEditExpensePage,
    FyCurrencyComponent,
    FyCurrencyChooseCurrencyComponent,
    FyCurrencyExchangeRateComponent,
    FySelectProjectComponent,
    FySelectModalComponent,
    FySelectVendorComponent,
    FySelectVendorModalComponent,
    SplitExpensePopoverComponent,
    CriticalPolicyViolationComponent,
    PolicyViolationComponent
  ]
})
export class AddEditExpensePageModule { }
