import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MyViewExpensePageRoutingModule } from './my-view-expense-routing.module';
import { MyViewExpensePage } from './my-view-expense.page';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../shared/shared.module';
import { PinchZoomModule } from 'ngx-pinch-zoom';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyViewExpensePageRoutingModule,
    MatIconModule,
    SharedModule,
    PinchZoomModule,
    PdfViewerModule
  ],
  declarations: [
    MyViewExpensePage
  ]
})
export class MyViewExpensePageModule {}
