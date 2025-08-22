import { Component, Input, inject, input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-fy-critical-policy-violation',
  templateUrl: './fy-critical-policy-violation.component.html',
  styleUrls: ['./fy-critical-policy-violation.component.scss'],
  standalone: false,
})
export class FyCriticalPolicyViolationComponent {
  private modalController = inject(ModalController);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() criticalViolationMessages = [];

  readonly showHeader = input(true);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() showCTA = true;

  readonly showDragBar = input(true);

  readonly showCloseIcon = input(false);

  readonly isSplitBlocked = input<boolean>(false);

  readonly isSplitMissingFields = input<boolean>(false);

  readonly isReceiptMissing = input<boolean>(false);

  cancel(): void {
    this.modalController.dismiss(false);
  }

  continue(): void {
    this.modalController.dismiss(true);
  }
}
