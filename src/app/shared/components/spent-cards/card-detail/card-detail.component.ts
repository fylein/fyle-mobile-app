import { Component, Input, inject, input } from '@angular/core';
import { Params, Router } from '@angular/router';
import { PlatformCorporateCardDetail } from 'src/app/core/models/platform-corporate-card-detail.model';
import { PlatformOrgSettingsService } from 'src/app/core/services/platform/v1/spender/org-settings.service';
import { TrackingService } from 'src/app/core/services/tracking.service';

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
  standalone: false,
})
export class CardDetailComponent {
  private router = inject(Router);

  private trackingService = inject(TrackingService);

  private orgSettingService = inject(PlatformOrgSettingsService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() cardDetail: PlatformCorporateCardDetail;

  readonly homeCurrency = input<string>(undefined);

  readonly currencySymbol = input<string>(undefined);

  // To track if the screen is small (320px or below)
  isSmallScreen = window.innerWidth <= 320;

  goToExpensesPage(state: string, cardDetail: PlatformCorporateCardDetail): void {
    if (state === 'incompleteExpenses' && cardDetail.stats.totalDraftTxns && cardDetail.stats.totalDraftTxns > 0) {
      const queryParams: Params = {
        filters: JSON.stringify({ state: ['DRAFT'], cardNumbers: [this.cardDetail?.card.card_number] }),
      };

      this.router.navigate(['/', 'enterprise', 'my_expenses'], {
        queryParams,
      });

      this.trackingService.dashboardOnIncompleteCardExpensesClick();
    } else if (
      state === 'completeExpenses' &&
      cardDetail.stats.totalCompleteTxns &&
      cardDetail.stats.totalCompleteTxns > 0
    ) {
      const queryParams: Params = {
        filters: JSON.stringify({ state: ['READY_TO_REPORT'], cardNumbers: [this.cardDetail?.card.card_number] }),
      };
      this.router.navigate(['/', 'enterprise', 'my_expenses'], {
        queryParams,
      });

      this.trackingService.dashboardOnCompleteCardExpensesClick();
    }
  }
}
