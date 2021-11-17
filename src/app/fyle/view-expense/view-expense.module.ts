import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ViewExpensePageRoutingModule } from './view-expense-routing.module';
import { ViewExpensePage } from './view-expense.page';
import { SharedModule } from '../../shared/shared.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PinchZoomModule } from 'ngx-pinch-zoom';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewExpensePageRoutingModule,
    SharedModule,
    PinchZoomModule,
    PdfViewerModule,
    MatButtonModule,
  ],
  declarations: [ViewExpensePage],
})
export class ViewExpensePageModule {}
