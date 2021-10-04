import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ViewTeamTripPageRoutingModule } from './view-team-trip-routing.module';
import { ViewTeamTripPage } from './view-team-trip.page';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TransportationRequestComponent } from '../view-team-trip/transportation-request/transportation-request.component';
import { AdvanceRequestComponent } from '../view-team-trip/advance-request/advance-request.component';
import { HotelRequestComponent } from '../view-team-trip/hotel-request/hotel-request.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActionPopoverComponent } from './action-popover/action-popover.component';
import { MatRippleModule } from '@angular/material/core';
import { ActionConfirmationPopoverComponent } from './action-confirmation-popover/action-confirmation-popover.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewTeamTripPageRoutingModule,
    MatIconModule,
    MatButtonModule,
    SharedModule,
    MatRippleModule,
  ],
  declarations: [
    ViewTeamTripPage,
    TransportationRequestComponent,
    AdvanceRequestComponent,
    HotelRequestComponent,
    ActionPopoverComponent,
    ActionConfirmationPopoverComponent,
  ],
})
export class ViewTeamTripPageModule {}
