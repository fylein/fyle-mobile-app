import { Component, Input, inject, input } from '@angular/core';
import { IonButton, IonFooter, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { MatIcon } from '@angular/material/icon';
import { PolicyViolationRuleComponent } from '../policy-violation-rule/policy-violation-rule.component';
import { FyAlertInfoComponent } from '../fy-alert-info/fy-alert-info.component';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-critical-policy-violation',
  templateUrl: './fy-critical-policy-violation.component.html',
  styleUrls: ['./fy-critical-policy-violation.component.scss'],
  imports: [
    FyAlertInfoComponent,
    IonButton,
    IonFooter,
    IonToolbar,
    MatIcon,
    PolicyViolationRuleComponent,
    TranslocoPipe
  ],
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
