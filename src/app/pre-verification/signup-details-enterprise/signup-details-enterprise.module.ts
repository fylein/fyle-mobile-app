import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignupDetailsEnterprisePageRoutingModule } from './signup-details-enterprise-routing.module';

import { SignupDetailsEnterprisePage } from './signup-details-enterprise.page';

import { MatInputModule } from '@angular/material/input';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';

import { SelectionModalComponent } from './selection-modal/selection-modal.component';
import { MatRippleModule } from '@angular/material/core';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignupDetailsEnterprisePageRoutingModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatRippleModule,
    SharedModule
  ],
  declarations: [
    SignupDetailsEnterprisePage,
    SelectionModalComponent
  ]
})
export class SignupDetailsEnterprisePageModule { }
