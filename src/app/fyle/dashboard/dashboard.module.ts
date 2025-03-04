import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DashboardPageRoutingModule } from './dashboard-routing.module';
import { DashboardPage } from './dashboard.page';
import { MatExpansionModule } from '@angular/material/expansion';
import { SharedModule } from 'src/app/shared/shared.module';
import { DashboardService } from 'src/app/fyle/dashboard/dashboard.service';
import { MatIconModule } from '@angular/material/icon';
import { StatsComponent } from './stats/stats.component';
import { StatBadgeComponent } from './stat-badge/stat-badge.component';
import { MatRippleModule } from '@angular/material/core';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { TasksComponent } from './tasks/tasks.component';
import { TasksCardComponent } from './tasks/tasks-card/tasks-card.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { SwiperModule } from 'swiper/angular';
import { CardStatsComponent } from './card-stats/card-stats.component';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    MatExpansionModule,
    SharedModule,
    MatIconModule,
    MatRippleModule,
    MatTabsModule,
    MatBottomSheetModule,
    MatSnackBarModule,
    SwiperModule,
    NgxMaskModule.forRoot({
      validation: false,
    }),
  ],
  declarations: [
    DashboardPage,
    StatsComponent,
    StatBadgeComponent,
    TasksComponent,
    TasksCardComponent,
    CardStatsComponent,
  ],
  providers: [DashboardService],
})
export class DashboardPageModule {}
