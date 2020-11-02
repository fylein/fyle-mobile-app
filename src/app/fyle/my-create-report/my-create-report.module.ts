import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyCreateReportPageRoutingModule } from './my-create-report-routing.module';

import { MyCreateReportPage } from './my-create-report.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyCreateReportPageRoutingModule
  ],
  declarations: [MyCreateReportPage]
})
export class MyCreateReportPageModule {}
