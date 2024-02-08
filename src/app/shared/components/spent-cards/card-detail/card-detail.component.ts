import { Component, Input, OnInit } from '@angular/core';
import { Params, Router } from '@angular/router';
import { map, noop } from 'rxjs';
import { CardStatus } from 'src/app/core/enums/card-status.enum';
import { PlatformCorporateCardDetail } from 'src/app/core/models/platform-corporate-card-detail.model';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { TrackingService } from 'src/app/core/services/tracking.service';

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
})
export class CardDetailComponent implements OnInit {
  @Input() cardDetail: PlatformCorporateCardDetail;

  @Input() homeCurrency: string;

  @Input() currencySymbol: string;

  redirectToNewPage = false;

  showVirtualCard: boolean;

  CardStatus: typeof CardStatus = CardStatus;

  constructor(
    private router: Router,
    private trackingService: TrackingService,
    private orgSettingService: OrgSettingsService
  ) {}

  ngOnInit(): void {
    this.showVirtualCard =
      this.cardDetail.card.virtual_card_id &&
      this.cardDetail.virtualCardDetail &&
      (this.cardDetail.stats?.totalTxnsCount > 0 ||
        this.cardDetail.card.virtual_card_state === CardStatus.ACTIVE ||
        this.cardDetail.card.virtual_card_state === CardStatus.PREACTIVE);
    this.orgSettingService
      .get()
      .pipe(
        map((orgSettings) => {
          if (orgSettings.mobile_app_my_expenses_beta_enabled) {
            this.redirectToNewPage = true;
          }
        })
      )
      .subscribe(noop);
  }

  goToExpensesPage(state: string, cardDetail: PlatformCorporateCardDetail): void {
    if (state === 'incompleteExpenses' && cardDetail.stats.totalDraftTxns && cardDetail.stats.totalDraftTxns > 0) {
      const queryParams: Params = {
        filters: JSON.stringify({ state: ['DRAFT'], cardNumbers: [this.cardDetail?.card.card_number] }),
      };

      this.router.navigate(['/', 'enterprise', `${this.redirectToNewPage ? 'my_expenses_v2' : 'my_expenses'}`], {
        queryParams,
      });

      this.trackingService.dashboardOnIncompleteCardExpensesClick();
    } else if (state === 'totalExpenses' && cardDetail.stats.totalTxnsCount && cardDetail.stats.totalTxnsCount > 0) {
      const queryParams: Params = {
        filters: JSON.stringify({ state: ['DRAFT,READY_TO_REPORT'], cardNumbers: [this.cardDetail?.card.card_number] }),
      };
      this.router.navigate(['/', 'enterprise', `${this.redirectToNewPage ? 'my_expenses_v2' : 'my_expenses'}`], {
        queryParams,
      });

      this.trackingService.dashboardOnTotalCardExpensesClick();
    }
  }
}
