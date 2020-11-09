import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ViewTeamMileagePageRoutingModule } from './view-team-mileage-routing.module';
import { ViewTeamMileagePage } from './view-team-mileage.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewTeamMileagePageRoutingModule,
    SharedModule
  ],
  declarations: [ViewTeamMileagePage]
})
export class ViewTeamMileagePageModule {}
