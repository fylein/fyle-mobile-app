import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyViewTripsPageRoutingModule } from './my-view-trips-routing.module';

import { MyViewTripsPage } from './my-view-trips.page';

import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyViewTripsPageRoutingModule,
    MatIconModule
  ],
  declarations: [MyViewTripsPage]
})
export class MyViewTripsPageModule { }
