import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PlatformCorporateCard } from 'src/app/core/models/platform/platform-corporate-card.model';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';

@Component({
  selector: 'app-manage-corporate-cards',
  templateUrl: './manage-corporate-cards.page.html',
  styleUrls: ['./manage-corporate-cards.page.scss'],
})
export class ManageCorporateCardsPage {
  corporateCards$: Observable<PlatformCorporateCard[]>;

  constructor(private router: Router, private corporateCreditCardExpenseService: CorporateCreditCardExpenseService) {}

  goBack(): void {
    this.router.navigate(['/', 'enterprise', 'my_profile']);
  }

  ionViewWillEnter(): void {
    this.corporateCards$ = this.corporateCreditCardExpenseService.getCorporateCards();
  }
}
