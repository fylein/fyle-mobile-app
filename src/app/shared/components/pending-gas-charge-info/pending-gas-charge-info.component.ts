import { Component, Input, signal, computed, inject } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslocoService } from '@jsverse/transloco';
import { PendingGasChargeInfoModalComponent } from '../pending-gas-charge-info-modal/pending-gas-charge-info-modal.component';

@Component({
  selector: 'app-pending-gas-charge-info',
  templateUrl: './pending-gas-charge-info.component.html',
  styleUrls: ['./pending-gas-charge-info.component.scss'],
  standalone: false,
})
export class PendingGasChargeInfoComponent {
  // Signals for reactive state
  private readonly _isExpenseListView = signal<boolean | undefined>(undefined);

  private readonly modalController = inject(ModalController);

  private readonly translocoService = inject(TranslocoService);

  // Computed signal for CSS class
  readonly expenseListViewClass = computed(() => {
    const isListView = this._isExpenseListView();
    return isListView ? 'pending-gas-charge-info--expense-list-view' : '';
  });

  // Input setter to update signal
  // eslint-disable-next-line @angular-eslint/prefer-signals
  @Input() set isExpenseListView(value: boolean | undefined) {
    this._isExpenseListView.set(value);
  }

  get isExpenseListView(): boolean | undefined {
    return this._isExpenseListView();
  }

  async openPendingGasChargeInfoModal(event: Event): Promise<void> {
    event.stopPropagation();

    const modal = await this.modalController.create({
      component: PendingGasChargeInfoModalComponent,
      cssClass: 'pending-gas-charge-info-modal',
      showBackdrop: true,
      canDismiss: true,
      backdropDismiss: true,
      animated: true,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: false,
    });

    await modal.present();
  }

  openHelpArticle(): void {
    // Open help article in browser
    window.open('https://www.fylehq.com/help/en/articles/', '_blank');
  }
}
