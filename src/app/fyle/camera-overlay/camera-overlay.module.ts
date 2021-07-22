import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CameraOverlayPageRoutingModule } from './camera-overlay-routing.module';

import { CameraOverlayPage } from './camera-overlay.page';
import { MatIconModule } from '@angular/material/icon';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import {GalleryUploadSuccessPopupComponent} from './gallery-upload-success-popup/gallery-upload-success-popup.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        CameraOverlayPageRoutingModule,
        MatIconModule
    ],
    declarations: [
        CameraOverlayPage,
        GalleryUploadSuccessPopupComponent
    ],
    providers: [
        ImagePicker
    ]
})
export class CameraOverlayPageModule {}
