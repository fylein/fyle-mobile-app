import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ViewTeamMileagePageRoutingModule } from './view-team-mileage-routing.module';
import { ViewTeamMileagePage } from './view-team-mileage.page';
import { SharedModule } from '../../shared/shared.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ViewTeamMileagePageRoutingModule, SharedModule, MatButtonModule],
  declarations: [ViewTeamMileagePage],
})
export class ViewTeamMileagePageModule {}
