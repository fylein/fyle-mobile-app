import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CaptureReceiptPageRoutingModule } from './capture-receipt-routing.module';

import { CaptureReceiptPage } from './capture-receipt.page';
import { MatIconModule } from '@angular/material/icon';
import { ReceiptPreviewComponent } from './receipt-preview/receipt-preview.component';
import { PinchZoomModule } from 'ngx-pinch-zoom';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { AddMorePopupComponent } from './add-more-popup/add-more-popup.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CaptureReceiptPageRoutingModule,
    MatIconModule,
    PinchZoomModule,
    MatBottomSheetModule
  ],
  declarations: [
    CaptureReceiptPage,
    ReceiptPreviewComponent,
    AddMorePopupComponent,
    PinchZoomModule
  ],
  providers: [
    ImagePicker
  ]
})
export class CaptureReceiptPageModule {}
