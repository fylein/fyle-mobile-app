import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-corporate-cards',
  templateUrl: './manage-corporate-cards.page.html',
  styleUrls: ['./manage-corporate-cards.page.scss'],
})
export class ManageCorporateCardsPage {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/', 'enterprise', 'my_profile']);
  }
}
