import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatRippleModule } from '@angular/material/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { ViewTeamReportPage } from './view-team-report.page';
import { ViewTeamReportPageRoutingModule } from './view-team-report-routing.module';
import { ShareReportComponent } from './share-report/share-report.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewTeamReportPageRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    SharedModule,
    MatFormFieldModule,
    MatSnackBarModule,
  ],
  declarations: [ViewTeamReportPage, ShareReportComponent],
})
export class ViewTeamReportPageModule {}
