import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';

import { IonicModule } from '@ionic/angular';

import { CaptureReceiptPageRoutingModule } from './capture-receipt-routing.module';

import { CaptureReceiptPage } from './capture-receipt.page';
import { MatIconModule } from '@angular/material/icon';
import { ReceiptPreviewComponent } from './receipt-preview/receipt-preview.component';
import { PinchZoomModule } from 'ngx-pinch-zoom';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { AddMorePopupComponent } from './add-more-popup/add-more-popup.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { CropReceiptComponent } from './crop-receipt/crop-receipt.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CaptureReceiptPageRoutingModule,
    MatIconModule,
    PinchZoomModule,
    MatBottomSheetModule,
    ImageCropperModule,
    SharedModule,
  ],
  declarations: [CaptureReceiptPage, ReceiptPreviewComponent, AddMorePopupComponent, CropReceiptComponent],
  providers: [ImagePicker],
})
export class CaptureReceiptPageModule {}
