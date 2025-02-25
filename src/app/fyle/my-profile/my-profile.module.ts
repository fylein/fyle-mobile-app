import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MyProfilePageRoutingModule } from './my-profile-routing.module';
import { MyProfilePage } from './my-profile.page';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { SharedModule } from '../../shared/shared.module';
import { SelectCurrencyComponent } from './select-currency/select-currency.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { PreferenceSettingComponent } from './preference-setting/preference-setting.component';
import { EmployeeDetailsCardComponent } from './employee-details-card/employee-details-card.component';
import { MatRippleModule } from '@angular/material/core';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
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
    SharedModule,
    MatButtonModule,
    MatSnackBarModule,
    MatRippleModule,
    MatTooltipModule,
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
