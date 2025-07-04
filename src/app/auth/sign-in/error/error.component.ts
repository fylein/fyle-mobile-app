import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorComponent implements OnInit {
  @Input() header = '';

  @Input() error;

  constructor(
    private popoverController: PopoverController,
    private router: Router,
    private translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    this.header = this.header || this.translocoService.translate('error.accountDoesNotExist');
  }

  async closePopover(): Promise<void> {
    await this.popoverController.dismiss();
  }

  async routeTo(route: string[]): Promise<void> {
    this.router.navigate(route);
    await this.popoverController.dismiss();
  }
}
