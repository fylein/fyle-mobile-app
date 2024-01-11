import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyViewAdvanceRequestPageRoutingModule } from './my-view-advance-request-routing.module';

import { MyViewAdvanceRequestPage } from './my-view-advance-request.page';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { PinchZoomModule } from '@meddv/ngx-pinch-zoom';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyViewAdvanceRequestPageRoutingModule,
    MatIconModule,
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    PinchZoomModule,
    PdfViewerModule,
  ],
  declarations: [MyViewAdvanceRequestPage],
})
export class MyViewAdvanceRequestPageModule {}
