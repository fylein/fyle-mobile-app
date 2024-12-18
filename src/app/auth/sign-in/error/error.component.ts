import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorComponent {
  @Input() header = 'Account does not exist';

  @Input() error;

  constructor(private popoverController: PopoverController, private router: Router) {}

  async closePopover(): Promise<void> {
    await this.popoverController.dismiss();
  }

  async routeTo(route: string[]): Promise<void> {
    this.router.navigate(route);
    await this.popoverController.dismiss();
  }
}
