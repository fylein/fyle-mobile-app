import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TeamAdvancePageRoutingModule } from './team-advance-routing.module';
import { TeamAdvancePage } from './team-advance.page';
import { TeamAdvCardComponent } from './team-adv-card/team-adv-card.component';
import { MatRippleModule } from '@angular/material/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TeamAdvancePageRoutingModule,
    MatRippleModule,
    SharedModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatButtonModule,
  ],
  declarations: [TeamAdvancePage, TeamAdvCardComponent],
})
export class TeamAdvancePageModule {}
