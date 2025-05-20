import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppVersionPageRoutingModule } from './app-version-routing.module';

import { AppVersionPage } from './app-version.page';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, AppVersionPageRoutingModule, MatButtonModule],
  declarations: [AppVersionPage],
})
export class AppVersionPageModule {}
