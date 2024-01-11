import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

import { SupportDialogPageRoutingModule } from './support-dialog-routing.module';

import { SupportDialogPage } from './support-dialog.page';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, MatButtonModule, SupportDialogPageRoutingModule, MatIconModule],
  declarations: [SupportDialogPage],
})
export class SupportDialogPageModule {}
