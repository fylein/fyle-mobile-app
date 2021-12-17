import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyViewReportPageRoutingModule } from './my-view-report-routing.module';

import { MyViewReportPage } from './my-view-report.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MyViewReportEtxnCardComponent } from './my-view-report-etxn-card/my-view-report-etxn-card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { ShareReportComponent } from './share-report/share-report.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SubmitReportPopoverComponent } from './submit-report-popover/submit-report-popover.component';
import { ResubmitReportPopoverComponent } from './resubmit-report-popover/resubmit-report-popover.component';
import { EditReportNamePopoverComponent } from './edit-report-name-popover/edit-report-name-popover.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyViewReportPageRoutingModule,
    SharedModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  declarations: [
    MyViewReportPage,
    MyViewReportEtxnCardComponent,
    ShareReportComponent,
    SubmitReportPopoverComponent,
    ResubmitReportPopoverComponent,
    EditReportNamePopoverComponent,
  ],
})
export class MyViewReportPageModule {}
