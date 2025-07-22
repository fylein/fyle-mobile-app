import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppVersionPageRoutingModule } from './app-version-routing.module';

import { AppVersionPage } from './app-version.page';

import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, AppVersionPageRoutingModule, MatButtonModule, AppVersionPage],
})
export class AppVersionPageModule {}
