import { Component, Input } from '@angular/core';
import { Params, Router } from '@angular/router';
import { PlatformCorporateCardDetail } from 'src/app/core/models/platform-corporate-card-detail.model';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { TrackingService } from 'src/app/core/services/tracking.service';

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
})
export class CardDetailComponent {
  @Input() cardDetail: PlatformCorporateCardDetail;

  @Input() homeCurrency: string;

  @Input() currencySymbol: string;

  // To track if the screen is small (320px or below)
  isSmallScreen = window.innerWidth <= 320;

  constructor(
    private router: Router,
    private trackingService: TrackingService,
    private orgSettingService: OrgSettingsService
  ) {}

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
