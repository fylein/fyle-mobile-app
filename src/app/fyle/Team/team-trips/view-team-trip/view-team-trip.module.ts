import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewTeamTripPageRoutingModule } from './view-team-trip-routing.module';

import { ViewTeamTripPage } from './view-team-trip.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewTeamTripPageRoutingModule
  ],
  declarations: [ViewTeamTripPage]
})
export class ViewTeamTripPageModule {}
