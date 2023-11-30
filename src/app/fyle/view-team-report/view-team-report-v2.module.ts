import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { ShareReportComponent } from './share-report/share-report.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ViewTeamReportPageV2 } from './view-team-report-v2.page';
import { ViewTeamReportPageV2RoutingModule } from './view-team-report-v2-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewTeamReportPageV2RoutingModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    SharedModule,
    MatFormFieldModule,
    MatSnackBarModule,
  ],
  declarations: [ViewTeamReportPageV2, ShareReportComponent],
})
export class ViewTeamReportPageV2Module {}
