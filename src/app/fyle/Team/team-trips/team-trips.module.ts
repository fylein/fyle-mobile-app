import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TeamTripsPageRoutingModule } from './team-trips-routing.module';

import { TeamTripsPage } from './team-trips.page';
import { TeamTripCardComponent } from './team-trip-card/team-trip-card.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TeamTripsPageRoutingModule,
    SharedModule
  ],
  declarations: [
    TeamTripsPage,
    TeamTripCardComponent
  ]
})
export class TeamTripsPageModule {}
