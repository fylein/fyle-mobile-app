import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ViewTeamAdvancePageRoutingModule } from './view-team-advance-routing.module';
import { ViewTeamAdvancePage } from './view-team-advance.page';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewTeamAdvancePageRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule
  ],
  declarations: [ViewTeamAdvancePage]
})
export class ViewTeamAdvancePageModule {}
