import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyAdvancesPageRoutingModule } from './my-advances-routing.module';

import { MyAdvancesPage } from './my-advances.page';
import { MyAdvancesCardComponent } from './my-advances-card/my-advances-card.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyAdvancesPageRoutingModule,
    SharedModule,
    MyAdvancesPage,
    MyAdvancesCardComponent,
  ],
})
export class MyAdvancesPageModule {}
