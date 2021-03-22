import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ViewTeamExpensePageRoutingModule } from './view-team-expense-routing.module';
import { ViewTeamExpensePage } from './view-team-expense.page';
import { SharedModule } from '../../shared/shared.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PinchZoomModule } from 'ngx-pinch-zoom';
import { RemoveExpenseReportComponent } from './remove-expense-report/remove-expense-report.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewTeamExpensePageRoutingModule,
    SharedModule,
    PinchZoomModule,
    PdfViewerModule,
    MatButtonModule
  ],
  declarations: [
    ViewTeamExpensePage,
    RemoveExpenseReportComponent
  ]
})
export class ViewTeamExpensePageModule {}
