import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TeamTripsPageRoutingModule } from './team-trips-routing.module';

import { TeamTripsPage } from './team-trips.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TeamTripsPageRoutingModule
  ],
  declarations: [TeamTripsPage]
})
export class TeamTripsPageModule {}
