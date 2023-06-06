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
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PreferenceSettingComponent } from './preference-setting/preference-setting.component';
import { EmployeeDetailsCardComponent } from './employee-details-card/employee-details-card.component';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyProfilePageRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    SharedModule,
    MatButtonModule,
    MatSnackBarModule,
    MatRippleModule,
    MatTooltipModule,
  ],
  declarations: [MyProfilePage, SelectCurrencyComponent, PreferenceSettingComponent, EmployeeDetailsCardComponent],
})
export class MyProfilePageModule {}
