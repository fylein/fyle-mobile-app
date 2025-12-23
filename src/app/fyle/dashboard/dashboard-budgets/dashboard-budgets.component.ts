import { Component, input } from '@angular/core';
import { Budget } from 'src/app/core/models/budget.model';
import { TranslocoPipe } from '@jsverse/transloco';
import SwiperCore, { Pagination } from 'swiper';
import { PaginationOptions } from 'swiper/types';
import { SwiperModule } from 'swiper/angular';
import { IonSkeletonText } from '@ionic/angular/standalone';

// install Swiper modules
SwiperCore.use([Pagination]);

@Component({
  selector: 'app-dashboard-budgets',
  templateUrl: './dashboard-budgets.component.html',
  styleUrls: ['./dashboard-budgets.component.scss'],
  imports: [TranslocoPipe, SwiperModule, IonSkeletonText],
})
export class DashboardBudgetsComponent {
  readonly budgets = input<Budget[]>([]);

  readonly isLoading = input<boolean>(false);

  readonly areDashboardTabsEnabled = input<boolean>(false);

  // TODO: @SahilK-027 fix design
  pagination: PaginationOptions = {
    dynamicBullets: true,
    renderBullet(index, className): string {
      return '<span class="dashboard-budgets ' + className + '"> </span>';
    },
  };
}
