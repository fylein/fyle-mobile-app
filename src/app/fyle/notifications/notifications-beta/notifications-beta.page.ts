import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications-beta',
  templateUrl: './notifications-beta.page.html',
  styleUrls: ['./notifications-beta.page.scss'],
})
export class NotificationsBetaPage {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/', 'enterprise', 'my_profile']);
  }
}
