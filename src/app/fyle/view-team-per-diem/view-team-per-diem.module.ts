import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ViewTeamPerDiemPageRoutingModule } from './view-team-per-diem-routing.module';
import { ViewTeamPerDiemPage } from './view-team-per-diem.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewTeamPerDiemPageRoutingModule,
    SharedModule
  ],
  declarations: [ViewTeamPerDiemPage]
})
export class ViewTeamPerDiemPageModule {}
