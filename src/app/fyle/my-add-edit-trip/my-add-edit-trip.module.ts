import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MyAddEditTripPageRoutingModule } from './my-add-edit-trip-routing.module';
import { MyAddEditTripPage } from './my-add-edit-trip.page';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MyAddEditTripPageRoutingModule,
    MatIconModule
  ],
  declarations: [MyAddEditTripPage]
})
export class MyAddEditTripPageModule {}
