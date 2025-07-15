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
import { MyViewReportPage } from './my-view-report.page';
import { MyViewReportPageRoutingModule } from './my-view-report-routing.module';
import { AddExpensesToReportComponent } from './add-expenses-to-report/add-expenses-to-report.component';
import { EditReportNamePopoverComponent } from './edit-report-name-popover/edit-report-name-popover.component';
import { ShareReportComponent } from './share-report/share-report.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyViewReportPageRoutingModule,
    SharedModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatCheckboxModule,
  ],
  declarations: [MyViewReportPage, ShareReportComponent, EditReportNamePopoverComponent, AddExpensesToReportComponent],
})
export class MyViewReportPageModule {}
