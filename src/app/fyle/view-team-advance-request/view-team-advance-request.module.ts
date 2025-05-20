import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ViewTeamAdvanceRequestPageRoutingModule } from './view-team-advance-request-routing.module';
import { ViewTeamAdvanceRequestPage } from './view-team-advance-request.page';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatRippleModule } from '@angular/material/core';
import { SharedModule } from '../../shared/shared.module';
import { AdvanceActionsComponent } from './advance-actions/advance-actions.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewTeamAdvanceRequestPageRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    SharedModule,
  ],
  declarations: [ViewTeamAdvanceRequestPage, AdvanceActionsComponent],
})
export class ViewTeamAdvanceRequestPageModule {}
