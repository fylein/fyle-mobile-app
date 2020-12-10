import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddEditAdvanceRequestPageRoutingModule } from './add-edit-advance-request-routing.module';

import { AddEditAdvanceRequestPage } from './add-edit-advance-request.page';
import { MatIconModule } from '@angular/material/icon';
import { FyCurrencyComponent } from './fy-currency/fy-currency.component';
import { FyCurrencyChooseCurrencyComponent } from './fy-currency/fy-currency-choose-currency/fy-currency-choose-currency.component';
import { FyCurrencyExchangeRateComponent } from './fy-currency/fy-currency-exchange-rate/fy-currency-exchange-rate.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from 'src/app/shared/shared.module';
import { FySelectProjectComponent } from './fy-select-project/fy-select-project.component';
import { FySelectModalComponent } from './fy-select-project/fy-select-modal/fy-select-modal.component';
import { PolicyViolationDialogComponent } from './policy-violation-dialog/policy-violation-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CameraOptionsPopupComponent } from './camera-options-popup/camera-options-popup.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddEditAdvanceRequestPageRoutingModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    SharedModule,
    MatCheckboxModule,
  ],
  declarations: [
    AddEditAdvanceRequestPage,
    FyCurrencyComponent,
    FyCurrencyChooseCurrencyComponent,
    FyCurrencyExchangeRateComponent,
    FySelectProjectComponent,
    FySelectModalComponent,
    PolicyViolationDialogComponent,
    CameraOptionsPopupComponent
  ]
})
export class AddEditAdvanceRequestPageModule {}
