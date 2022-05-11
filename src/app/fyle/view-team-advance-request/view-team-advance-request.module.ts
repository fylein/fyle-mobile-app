import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { viewTeamAdvanceRequestPageRoutingModule } from './view-team-advance-request-routing.module';
import { viewTeamAdvanceRequestPage } from './view-team-advance-request.page';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { SharedModule } from '../../shared/shared.module';
import { AdvanceActionsComponent } from './advance-actions/advance-actions.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    viewTeamAdvanceRequestPageRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    SharedModule,
  ],
  declarations: [viewTeamAdvanceRequestPage, AdvanceActionsComponent],
})
export class viewTeamAdvanceRequestPageModule {}
