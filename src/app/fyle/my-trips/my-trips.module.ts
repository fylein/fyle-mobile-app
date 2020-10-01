import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyTripsPageRoutingModule } from './my-trips-routing.module';

import { MyTripsPage } from './my-trips.page';

import { MatCardModule } from '@angular/material/card';

import { MyTripsCardComponent } from './my-trips-card/my-trips-card.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyTripsPageRoutingModule,
    MatCardModule,
    SharedModule
  ],
  declarations: [
    MyTripsPage,
    MyTripsCardComponent
  ]
})
export class MyTripsPageModule { }
