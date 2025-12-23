import { Component, inject, input, OnDestroy, signal } from '@angular/core';
import { Budget } from 'src/app/core/models/budget.model';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import SwiperCore, { Pagination } from 'swiper';
import { PaginationOptions } from 'swiper/types';
import { SwiperModule } from 'swiper/angular';
import { IonSkeletonText } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { Subject, takeUntil } from 'rxjs';
import { MatIcon } from '@angular/material/icon';

// install Swiper modules
SwiperCore.use([Pagination]);

@Component({
  selector: 'app-dashboard-budgets',
  templateUrl: './dashboard-budgets.component.html',
  styleUrls: ['./dashboard-budgets.component.scss'],
  imports: [TranslocoPipe, SwiperModule, IonSkeletonText, CommonModule, MatIcon],
})
export class DashboardBudgetsComponent implements OnDestroy {
  readonly budgets = input<Budget[]>([]);

  readonly homeCurrency = signal<string | null>(null);

  readonly isLoading = input<boolean>(false);

  readonly areDashboardTabsEnabled = input<boolean>(false);

  private currencyService: CurrencyService = inject(CurrencyService);

  private translocoService: TranslocoService = inject(TranslocoService);

  private componentDestroyed$ = new Subject<void>();

  constructor() {
    this.currencyService
      .getHomeCurrency()
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe((currency) => {
        this.homeCurrency.set(currency);
      });
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  getCurrentBudgetType(budget: Budget): string {
    switch (budget.type) {
      case 'MONTHLY':
        return this.translocoService.translate('dashboardBudgets.monthly');
      case 'QUARTERLY':
        return this.translocoService.translate('dashboardBudgets.quarterly');
      case 'YEARLY':
        return this.translocoService.translate('dashboardBudgets.yearly');
      case 'ONE_TIME':
        return this.translocoService.translate('dashboardBudgets.oneTime');
      default:
        return '';
    }
  }
}
