import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SetupAccountPageRoutingModule } from './setup-account-routing.module';

import { SetupAccountPage } from './setup-account.page';

import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';

import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';

import { SelectCurrencyComponent } from './select-currency/select-currency.component';

import { MatRippleModule } from '@angular/material/core';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SetupAccountPageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatButtonModule,
  ],
  declarations: [SetupAccountPage, SelectCurrencyComponent],
})
export class SetupAccountPageModule {}
