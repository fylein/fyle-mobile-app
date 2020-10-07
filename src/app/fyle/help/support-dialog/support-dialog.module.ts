import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { MatButtonModule } from '@angular/material/button';

import { SupportDialogPageRoutingModule } from './support-dialog-routing.module';

import { SupportDialogPage } from './support-dialog.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatButtonModule,
    SupportDialogPageRoutingModule
  ],
  declarations: [SupportDialogPage]
})
export class SupportDialogPageModule {}
