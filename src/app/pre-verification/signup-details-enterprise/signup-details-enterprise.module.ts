import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignupDetailsEnterprisePageRoutingModule } from './signup-details-enterprise-routing.module';

import { SignupDetailsEnterprisePage } from './signup-details-enterprise.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignupDetailsEnterprisePageRoutingModule
  ],
  declarations: [SignupDetailsEnterprisePage]
})
export class SignupDetailsEnterprisePageModule {}
