import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TeamAdvancePageRoutingModule } from './team-advance-routing.module';
import { TeamAdvancePage } from './team-advance.page';
import { TeamAdvCardComponent } from './team-adv-card/team-adv-card.component';
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TeamAdvancePageRoutingModule,
    MatRippleModule
  ],
  declarations: [
    TeamAdvancePage,
    TeamAdvCardComponent
  ]
})
export class TeamAdvancePageModule {}
