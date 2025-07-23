import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { MatIcon } from '@angular/material/icon';
import { PolicyViolationRuleComponent } from '../policy-violation-rule/policy-violation-rule.component';
import { FyAlertInfoComponent } from '../fy-alert-info/fy-alert-info.component';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-fy-critical-policy-violation',
    templateUrl: './fy-critical-policy-violation.component.html',
    styleUrls: ['./fy-critical-policy-violation.component.scss'],
    imports: [
        MatIcon,
        PolicyViolationRuleComponent,
        FyAlertInfoComponent,
        IonicModule,
        TranslocoPipe,
    ],
})
export class FyCriticalPolicyViolationComponent {
  @Input() criticalViolationMessages = [];

  @Input() showHeader = true;

  @Input() showCTA = true;

  @Input() showDragBar = true;

  @Input() showCloseIcon = false;

  @Input() isSplitBlocked? = false;

  @Input() isSplitMissingFields? = false;

  @Input() isReceiptMissing? = false;

  constructor(private modalController: ModalController) {}

  cancel(): void {
    this.modalController.dismiss(false);
  }

  continue(): void {
    this.modalController.dismiss(true);
  }
}
