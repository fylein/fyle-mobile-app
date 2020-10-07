import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ViewTeamTripPageRoutingModule } from './view-team-trip-routing.module';
import { ViewTeamTripPage } from './view-team-trip.page';
import { MatIconModule } from '@angular/material/icon';
import { TransportationRequestComponent } from '../transportation-request/transportation-request.component';
import { AdvanceRequestComponent } from '../advance-request/advance-request.component';
import { HotelRequestComponent } from '../hotel-request/hotel-request.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewTeamTripPageRoutingModule,
    MatIconModule
  ],
  declarations: [
    ViewTeamTripPage,
    TransportationRequestComponent,
    AdvanceRequestComponent,
    HotelRequestComponent
  ]
})
export class ViewTeamTripPageModule {}
