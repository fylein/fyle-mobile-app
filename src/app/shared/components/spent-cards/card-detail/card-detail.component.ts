import { Component, Input } from '@angular/core';
import { Params, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PlatformCorporateCardDetails } from 'src/app/core/models/platform-corporate-card-details.model';
import { TrackingService } from 'src/app/core/services/tracking.service';

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
})
export class CardDetailComponent {
  @Input() cardDetail: PlatformCorporateCardDetails;

  @Input() homeCurrency: Observable<string>;

  @Input() currencySymbol: Observable<string>;

  constructor(private router: Router, private trackingService: TrackingService) {}

  goToExpensesPage(state: string, cardDetail: PlatformCorporateCardDetails): void {
    if (state === 'incompleteExpenses' && cardDetail.stats.totalDraftTxns && cardDetail.stats.totalDraftTxns > 0) {
      const queryParams: Params = {
        filters: JSON.stringify({ state: ['DRAFT'], cardNumbers: [this.cardDetail?.card.card_number] }),
      };
      this.router.navigate(['/', 'enterprise', 'my_expenses'], {
        queryParams,
      });

      this.trackingService.dashboardOnIncompleteCardExpensesClick();
    } else if (state === 'totalExpenses' && cardDetail.stats.totalTxnsCount && cardDetail.stats.totalTxnsCount > 0) {
      const queryParams: Params = {
        filters: JSON.stringify({ state: ['DRAFT,READY_TO_REPORT'], cardNumbers: [this.cardDetail?.card.card_number] }),
      };
      this.router.navigate(['/', 'enterprise', 'my_expenses'], {
        queryParams,
      });

      this.trackingService.dashboardOnTotalCardExpensesClick();
    }
  }
}
