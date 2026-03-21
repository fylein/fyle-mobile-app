import {
  Component,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Budget } from 'src/app/core/models/budget.model';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { IonSkeletonText, ModalController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { Subject, takeUntil } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { BudgetTotalUtilisationInfoModalComponent } from './budget-total-utilisation-info-modal/budget-total-utilisation-info-modal.component';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';

@Component({
  selector: 'app-dashboard-budgets',
  templateUrl: './dashboard-budgets.component.html',
  styleUrls: ['./dashboard-budgets.component.scss'],
  imports: [TranslocoPipe, IonSkeletonText, CommonModule, MatIcon, HumanizeCurrencyPipe],
})
export class DashboardBudgetsComponent implements AfterViewInit, OnDestroy {
  readonly swiperContainer = viewChild<ElementRef<HTMLElement>>('swiperContainer');

  readonly budgets = input<Budget[]>([]);

  readonly homeCurrency = signal<string | null>(null);

  readonly isLoading = input<boolean>(false);

  readonly areDashboardTabsEnabled = input<boolean>(false);

  readonly pagination = {
    dynamicBullets: true,
    renderBullet(index: number, className: string): string {
      return '<span class="dashboard-budgets ' + className + '"> </span>';
    },
  };

  private swiperInstance: Swiper | null = null;

  private currencyService: CurrencyService = inject(CurrencyService);

  private translocoService: TranslocoService = inject(TranslocoService);

  private modalController: ModalController = inject(ModalController);

  private componentDestroyed$ = new Subject<void>();

  constructor() {
    this.currencyService
      .getHomeCurrency()
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe((currency) => {
        this.homeCurrency.set(currency);
      });
  }

  ngAfterViewInit(): void {
    this.initSwiper();
  }

  ngOnDestroy(): void {
    this.swiperInstance?.destroy(true, true);
    this.swiperInstance = null;
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  private initSwiper(): void {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
      this.swiperInstance = null;
    }
    this.swiperInstance = new Swiper(this.swiperContainer().nativeElement, {
      modules: [Pagination],
      slidesPerView: 1.1,
      spaceBetween: 16,
      centeredSlides: this.budgets()?.length === 1,
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        ...this.pagination,
      },
    });
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

  async openTotalUtilisationInfoModal(event: Event): Promise<void> {
    event.stopPropagation();

    const modal = await this.modalController.create({
      component: BudgetTotalUtilisationInfoModalComponent,
      cssClass: 'budget-total-utilisation-info-modal',
      showBackdrop: true,
      canDismiss: true,
      backdropDismiss: true,
      animated: true,
      handle: false,
    });

    await modal.present();
  }
}
