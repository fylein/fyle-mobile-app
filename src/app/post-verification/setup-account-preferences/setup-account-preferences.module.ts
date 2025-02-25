import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SetupAccountPreferencesPageRoutingModule } from './setup-account-preferences-routing.module';

import { SetupAccountPreferencesPage } from './setup-account-preferences.page';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SetupAccountPreferencesPageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
  declarations: [SetupAccountPreferencesPage],
})
export class SetupAccountPreferencesPageModule {}
