import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MyAddEditTripPageRoutingModule } from './my-add-edit-trip-routing.module';
import { MyAddEditTripPage } from './my-add-edit-trip.page';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FySelectProjectComponent } from '../add-edit-expense/fy-select-project/fy-select-project.component';
import { SharedModule } from '../../shared/shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MyAddEditTripPageRoutingModule,
    MatIconModule,
    MatSelectModule,
    SharedModule,
    MatCheckboxModule
  ],
  declarations: [MyAddEditTripPage,
    FySelectProjectComponent
  ]
})
export class MyAddEditTripPageModule {}
