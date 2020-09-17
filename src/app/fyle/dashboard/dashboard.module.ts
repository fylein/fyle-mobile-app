import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';
import { MatExpansionModule } from '@angular/material/expansion';
import { EnterpriseDashboardCardComponent } from './enterprise-dashboard-card/enterprise-dashboard-card.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DashboardService } from 'src/app/fyle/dashboard/dashboard.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    MatExpansionModule,
    SharedModule
  ],
  declarations: [DashboardPage, EnterpriseDashboardCardComponent],
  providers: [
  	DashboardService
  ]
})
export class DashboardPageModule {}
