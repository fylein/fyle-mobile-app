import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyEditReportPageRoutingModule } from './my-edit-report-routing.module';

import { MyEditReportPage } from './my-edit-report.page';
import { MatIconModule } from '@angular/material/icon';
import { AddExpensesToReportComponent } from './add-expenses-to-report/add-expenses-to-report.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, MyEditReportPageRoutingModule, MatIconModule, SharedModule],
  declarations: [MyEditReportPage, AddExpensesToReportComponent]
})
export class MyEditReportPageModule {}
