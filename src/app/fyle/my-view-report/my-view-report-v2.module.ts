import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { ShareReportComponent } from './share-report/share-report.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EditReportNamePopoverComponent } from './edit-report-name-popover/edit-report-name-popover.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MyViewReportPageV2 } from './my-view-report-v2.page';
import { MyViewReportPageV2RoutingModule } from './my-view-report-v2-routing.module';
import { AddExpensesToReportV2Component } from './add-expenses-to-report-v2/add-expenses-to-report-v2.component';

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
    ShareReportComponent,
    EditReportNamePopoverComponent,
    AddExpensesToReportV2Component,
  ],
})
export class MyViewReportV2PageModule {}
