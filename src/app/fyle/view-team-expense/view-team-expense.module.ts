import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ViewTeamExpensePageRoutingModule } from './view-team-expense-routing.module';
import { ViewTeamExpensePage } from './view-team-expense.page';
import { SharedModule } from '../../shared/shared.module';
import { ViewAttachmentComponent } from './view-attachment/view-attachment.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PinchZoomModule } from 'ngx-pinch-zoom';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewTeamExpensePageRoutingModule,
    SharedModule,
    PinchZoomModule,
    PdfViewerModule
  ],
  declarations: [
    ViewTeamExpensePage,
    ViewAttachmentComponent
  ]
})
export class ViewTeamExpensePageModule {}
