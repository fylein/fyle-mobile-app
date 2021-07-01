import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CaptureReceiptPageRoutingModule } from './capture-receipt-routing.module';

import { CaptureReceiptPage } from './capture-receipt.page';
import { MatIconModule } from '@angular/material/icon';
import { ReceiptPreviewComponent } from './receipt-preview/receipt-preview.component';
import { PinchZoomModule } from 'ngx-pinch-zoom';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CaptureReceiptPageRoutingModule,
    MatIconModule,
    PinchZoomModule
  ],
  declarations: [
    CaptureReceiptPage,
    ReceiptPreviewComponent
  ]
})
export class CaptureReceiptPageModule {}
