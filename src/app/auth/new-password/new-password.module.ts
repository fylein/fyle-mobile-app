import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewPasswordPageRoutingModule } from './new-password-routing.module';

import { NewPasswordPage } from './new-password.page';

import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';

import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';

import { MatIconModule } from '@angular/material/icon';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

import { PopupComponent } from './popup/popup.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewPasswordPageRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    SharedModule,
  ],
  declarations: [NewPasswordPage, PopupComponent],
})
export class NewPasswordPageModule {}
