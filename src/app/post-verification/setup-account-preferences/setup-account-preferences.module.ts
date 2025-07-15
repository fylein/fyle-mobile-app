import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SetupAccountPreferencesPageRoutingModule } from './setup-account-preferences-routing.module';

import { SetupAccountPreferencesPage } from './setup-account-preferences.page';

import { MatButtonModule } from '@angular/material/button';

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
