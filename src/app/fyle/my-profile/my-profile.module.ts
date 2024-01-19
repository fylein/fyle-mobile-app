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
import { VerifyNumberPopoverComponent } from './verify-number-popover/verify-number-popover.component';
import { InfoCardComponent } from './info-card/info-card.component';
import { UpdateMobileNumberComponent } from './update-mobile-number/update-mobile-number.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyProfilePageRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatRippleModule,
    MatTooltipModule,
    SharedModule,
  ],
  declarations: [
    MyProfilePage,
    SelectCurrencyComponent,
    PreferenceSettingComponent,
    EmployeeDetailsCardComponent,
    VerifyNumberPopoverComponent,
    InfoCardComponent,
    UpdateMobileNumberComponent,
  ],
})
export class MyProfilePageModule {}
