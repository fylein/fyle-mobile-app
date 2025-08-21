import { Component, Input, inject } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-fy-critical-policy-violation',
  templateUrl: './fy-critical-policy-violation.component.html',
  styleUrls: ['./fy-critical-policy-violation.component.scss'],
  standalone: false,
})
export class FyCriticalPolicyViolationComponent {
  private modalController = inject(ModalController);

  @Input() criticalViolationMessages = [];

  @Input() showHeader = true;

  @Input() showCTA = true;

  @Input() showDragBar = true;

  @Input() showCloseIcon = false;

  @Input() isSplitBlocked? = false;

  @Input() isSplitMissingFields? = false;

  @Input() isReceiptMissing? = false;

  cancel(): void {
    this.modalController.dismiss(false);
  }

  continue(): void {
    this.modalController.dismiss(true);
  }
}
