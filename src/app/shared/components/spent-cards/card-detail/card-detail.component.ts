import { S } from '@angular/cdk/keycodes';
import { Component, Input, OnInit } from '@angular/core';
import { Params, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CardDetail } from 'src/app/core/models/card-detail.model';
import { TrackingService } from 'src/app/core/services/tracking.service';

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
})
export class CardDetailComponent implements OnInit {
  @Input() cardDetail: CardDetail;

  @Input() homeCurrency: Observable<string>;

  @Input() currencySymbol: Observable<string>;

  constructor(private router: Router, private trackingService: TrackingService) {}

  goToExpensesPage(state: string) {
    if (state === 'incompleteExpenses') {
      const queryParams: Params = {
        filters: JSON.stringify({ state: ['DRAFT'], cardNumbers: [this.cardDetail?.cardNumber] }),
      };
      this.router.navigate(['/', 'enterprise', 'my_expenses'], {
        queryParams,
      });

      this.trackingService.dashboardOnIncompleteCardExpensesClick();
    } else if (state === 'totalExpenses') {
      const queryParams: Params = {
        filters: JSON.stringify({ state: ['DRAFT,READY_TO_REPORT'], cardNumbers: [this.cardDetail?.cardNumber] }),
      };
      this.router.navigate(['/', 'enterprise', 'my_expenses'], {
        queryParams,
      });

      this.trackingService.dashboardOnTotalCardExpensesClick();
    }
  }

  ngOnInit() {}
}
