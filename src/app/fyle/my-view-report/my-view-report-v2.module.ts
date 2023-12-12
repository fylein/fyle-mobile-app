import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MyViewReportPageV2 } from './my-view-report-v2.page';
import { MyViewReportPageV2RoutingModule } from './my-view-report-v2-routing.module';
import { AddExpensesToReportV2Component } from './add-expenses-to-report-v2/add-expenses-to-report-v2.component';
import { EditReportNamePopoverComponentV2 } from './edit-report-name-popover-v2/edit-report-name-popover.component';
import { ShareReportComponentV2 } from './share-report-v2/share-report.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyViewReportPageV2RoutingModule,
    SharedModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatCheckboxModule,
  ],
  declarations: [
    MyViewReportPageV2,
    ShareReportComponentV2,
    EditReportNamePopoverComponentV2,
    AddExpensesToReportV2Component,
  ],
})
export class MyViewReportV2PageModule {}
