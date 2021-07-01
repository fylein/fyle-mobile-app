import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CaptureReceiptPageRoutingModule } from './capture-receipt-routing.module';

import { CaptureReceiptPage } from './capture-receipt.page';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CaptureReceiptPageRoutingModule,
    MatIconModule
  ],
  declarations: [CaptureReceiptPage]
})
export class CaptureReceiptPageModule {}
