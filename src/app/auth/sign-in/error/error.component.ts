import { Component, Input, OnInit, inject } from '@angular/core';
import { PopoverController, IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
  imports: [IonicModule, TranslocoPipe],
})
export class ErrorComponent implements OnInit {
  private popoverController = inject(PopoverController);

  private router = inject(Router);

  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() header = '';

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() error;

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
