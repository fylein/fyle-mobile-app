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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyViewReportPageRoutingModule,
    SharedModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule
  ],
  declarations: [
    MyViewReportPage,
    MyViewReportEtxnCardComponent
  ]
})
export class MyViewReportPageModule { }
