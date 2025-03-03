import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyCreateReportPageRoutingModule } from './my-create-report-routing.module';

import { MyCreateReportPage } from './my-create-report.page';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyCreateReportPageRoutingModule,
    MatIconModule,
    SharedModule,
    MatCheckboxModule,
  ],
  declarations: [MyCreateReportPage],
})
export class MyCreateReportPageModule {}
