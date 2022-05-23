import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddEditAdvanceRequestPageRoutingModule } from './add-edit-advance-request-routing.module';

import { AddEditAdvanceRequestPage } from './add-edit-advance-request.page';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from 'src/app/shared/shared.module';
import { PolicyViolationDialogComponent } from './policy-violation-dialog/policy-violation-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CameraOptionsPopupComponent } from './camera-options-popup/camera-options-popup.component';
import { PinchZoomModule } from 'ngx-pinch-zoom';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DraftAdvanceSummaryComponent } from './draft-advance-summary/draft-advance-summary.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddEditAdvanceRequestPageRoutingModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    SharedModule,
    MatCheckboxModule,
    PinchZoomModule,
    PdfViewerModule,
  ],
  declarations: [
    AddEditAdvanceRequestPage,
    PolicyViolationDialogComponent,
    CameraOptionsPopupComponent,
    DraftAdvanceSummaryComponent,
  ],
})
export class AddEditAdvanceRequestPageModule {}
