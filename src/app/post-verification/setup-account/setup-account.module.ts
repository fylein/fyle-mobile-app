import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SetupAccountPageRoutingModule } from './setup-account-routing.module';

import { SetupAccountPage } from './setup-account.page';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';

import { SelectCurrencyComponent } from './select-currency/select-currency.component';

import { MatRippleModule } from '@angular/material/core';

import { MatButtonModule } from '@angular/material/button';

import { TranslocoModule } from '@jsverse/transloco';

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
    TranslocoModule,
  ],
  declarations: [SetupAccountPage, SelectCurrencyComponent],
})
export class SetupAccountPageModule {}
