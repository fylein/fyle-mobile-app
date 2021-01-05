import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ViewTeamReportPageRoutingModule } from './view-team-report-routing.module';
import { ViewTeamReportPage } from './view-team-report.page';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { ViewTeamReportEtxnCardComponent } from './view-team-report-etxn-card/view-team-report-etxn-card.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ShareReportComponent } from './share-report/share-report.component';
import { SendBackComponent } from './send-back/send-back.component';
import { ApproveReportComponent } from './approve-report/approve-report.component';
import { MatFormFieldModule } from '@angular/material/form-field';

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
    MatFormFieldModule
  ],
  declarations: [
    ViewTeamReportPage,
    ViewTeamReportEtxnCardComponent,
    ShareReportComponent,
    SendBackComponent,
    ApproveReportComponent
  ]
})
export class ViewTeamReportPageModule {}
