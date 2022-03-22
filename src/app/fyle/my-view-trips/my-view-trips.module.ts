import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyViewTripsPageRoutingModule } from './my-view-trips-routing.module';

import { MyViewTripsPage } from './my-view-trips.page';

import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { TransportationRequestsComponent } from './transportation-requests/transportation-requests.component';
import { HotelRequestsComponent } from './hotel-requests/hotel-requests.component';
import { AdvanceRequestsComponent } from './advance-requests/advance-requests.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyViewTripsPageRoutingModule,
    MatIconModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    SharedModule,
  ],
  declarations: [MyViewTripsPage, TransportationRequestsComponent, HotelRequestsComponent, AdvanceRequestsComponent],
})
export class MyViewTripsPageModule {}
