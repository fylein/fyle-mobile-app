import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppVersionPageRoutingModule } from './app-version-routing.module';

import { AppVersionPage } from './app-version.page';

import { MatButtonModule } from '@angular/material/button';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, AppVersionPageRoutingModule, MatButtonModule, SharedModule],
  declarations: [AppVersionPage],
})
export class AppVersionPageModule {}
