import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';
import { MatExpansionModule } from '@angular/material/expansion';
import { EnterpriseDashboardCardComponent } from './enterprise-dashboard-card/enterprise-dashboard-card.component';
import { EnterpriseDashboardFooterComponent } from './enterprise-dashboard-footer/enterprise-dashboard-footer.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DashboardService } from 'src/app/fyle/dashboard/dashboard.service';
import { MatIconModule } from '@angular/material/icon';
import { GetStartedPopupComponent } from './get-started-popup/get-started-popup.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    MatExpansionModule,
    SharedModule,
    MatIconModule
  ],
  declarations: [
    DashboardPage,
    EnterpriseDashboardCardComponent,
    EnterpriseDashboardFooterComponent,
    GetStartedPopupComponent
  ],
  providers: [
  	DashboardService
  ]
})
export class DashboardPageModule {}
