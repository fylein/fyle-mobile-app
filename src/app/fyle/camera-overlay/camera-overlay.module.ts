import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CameraOverlayPageRoutingModule } from './camera-overlay-routing.module';

import { CameraOverlayPage } from './camera-overlay.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CameraOverlayPageRoutingModule
  ],
  declarations: [CameraOverlayPage]
})
export class CameraOverlayPageModule {}
