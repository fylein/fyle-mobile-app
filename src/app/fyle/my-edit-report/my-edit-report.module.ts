import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyEditReportPageRoutingModule } from './my-edit-report-routing.module';

import { MyEditReportPage } from './my-edit-report.page';
import { MatIconModule } from '@angular/material/icon';
import { AddExpensesToReportComponent } from './add-expenses-to-report/add-expenses-to-report.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyEditReportPageRoutingModule,
    MatIconModule
  ],
  declarations: [
    MyEditReportPage,
    AddExpensesToReportComponent
  ]
})
export class MyEditReportPageModule {}
