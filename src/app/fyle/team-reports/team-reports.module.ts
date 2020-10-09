import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TeamReportsPageRoutingModule } from './team-reports-routing.module';
import { TeamReportsPage } from './team-reports.page';
import { TeamReportCardComponent } from './team-report-card/team-report-card.component';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TeamReportsPageRoutingModule,
    SharedModule,
    MatIconModule
  ],
  declarations: [
    TeamReportsPage,
    TeamReportCardComponent
  ]
})
export class TeamReportsPageModule {}
