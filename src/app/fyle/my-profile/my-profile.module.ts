import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyProfilePageRoutingModule } from './my-profile-routing.module';

import { MyProfilePage } from './my-profile.page';
import { SelectCurrencyComponent } from 'src/app/post-verification/setup-account/select-currency/select-currency.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyProfilePageRoutingModule,
    MatFormFieldModule,
    MatInputModule
  ],
  declarations: [
    MyProfilePage,
    SelectCurrencyComponent]
})
export class MyProfilePageModule {}
