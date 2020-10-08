import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyViewAdvanceRequestPageRoutingModule } from './my-view-advance-request-routing.module';

import { MyViewAdvanceRequestPage } from './my-view-advance-request.page';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyViewAdvanceRequestPageRoutingModule,
    MatIconModule,
  ],
  declarations: [MyViewAdvanceRequestPage]
})
export class MyViewAdvanceRequestPageModule {}
