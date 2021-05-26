import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {DashboardPageRoutingModule} from './dashboard-routing.module';
import {DashboardPage} from './dashboard.page';
import {MatExpansionModule} from '@angular/material/expansion';
import {SharedModule} from 'src/app/shared/shared.module';
import {DashboardService} from 'src/app/fyle/dashboard/dashboard.service';
import {MatIconModule} from '@angular/material/icon';
import {GetStartedPopupComponent} from './get-started-popup/get-started-popup.component';
import {StatsComponent} from './stats/stats.component';
import {StatBadgeComponent} from './stat-badge/stat-badge.component';
import {MatRippleModule} from '@angular/material/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    MatExpansionModule,
    SharedModule,
    MatIconModule,
    MatRippleModule
  ],
  declarations: [
    DashboardPage,
    GetStartedPopupComponent,
    StatsComponent,
    StatBadgeComponent
  ],
  providers: [
    DashboardService
  ]
})
export class DashboardPageModule {
}
