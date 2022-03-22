import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ViewTeamAdvancePageRoutingModule } from './view-team-advance-routing.module';
import { ViewTeamAdvancePage } from './view-team-advance.page';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { SharedModule } from '../../shared/shared.module';
import { AdvanceActionsComponent } from './advance-actions/advance-actions.component';
import { ApproveAdvanceComponent } from './approve-advance/approve-advance.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewTeamAdvancePageRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    SharedModule,
  ],
  declarations: [ViewTeamAdvancePage, AdvanceActionsComponent, ApproveAdvanceComponent],
})
export class ViewTeamAdvancePageModule {}
