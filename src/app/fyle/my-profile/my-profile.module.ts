import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MyProfilePageRoutingModule } from './my-profile-routing.module';
import { MyProfilePage } from './my-profile.page';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '../../shared/shared.module';
import { SelectCurrencyComponent } from './select-currency/select-currency.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyProfilePageRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    SharedModule
  ],
  declarations: [
    MyProfilePage,
    SelectCurrencyComponent
  ]
})
export class MyProfilePageModule {}
