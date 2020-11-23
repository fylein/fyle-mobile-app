import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddEditPerDiemPageRoutingModule } from './add-edit-per-diem-routing.module';

import { AddEditPerDiemPage } from './add-edit-per-diem.page';
import { FyCurrencyComponent } from '../add-edit-per-diem/fy-currency/fy-currency.component';
import { FyCurrencyChooseCurrencyComponent } from '../add-edit-per-diem/fy-currency/fy-currency-choose-currency/fy-currency-choose-currency.component';
import { FyCurrencyExchangeRateComponent } from '../add-edit-per-diem/fy-currency/fy-currency-exchange-rate/fy-currency-exchange-rate.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FySelectProjectComponent } from '../add-edit-per-diem/fy-select-project/fy-select-project.component';
import { FySelectModalComponent } from './fy-select-project/fy-select-modal/fy-select-modal.component';
import { CriticalPolicyViolationComponent } from './critical-policy-violation/critical-policy-violation.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddEditPerDiemPageRoutingModule,
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
    AddEditPerDiemPage,
    FyCurrencyComponent,
    FyCurrencyChooseCurrencyComponent,
    FyCurrencyExchangeRateComponent,
    FySelectProjectComponent,
    FySelectModalComponent,
    CriticalPolicyViolationComponent
  ]
})
export class AddEditPerDiemPageModule {}
