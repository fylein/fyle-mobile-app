import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FyPolicyViolationComponent } from '../fy-policy-violation/fy-policy-violation.component';
import { PolicyViolationDetailsComponent } from '../policy-violation-details/policy-violation-details.component';

@Component({
  selector: 'app-fy-policy-violation-info',
  templateUrl: './fy-policy-violation-info.component.html',
  styleUrls: ['./fy-policy-violation-info.component.scss'],
})
export class FyPolicyViolationInfoComponent implements OnInit {
  @Input() policyDetails;

  @Input() criticalPolicyViolated;

  policyViolations;

  showPolicyInfo: boolean;

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.policyViolations = [];
    this.policyViolations =
      this.policyDetails && this.policyDetails.map((details) => details.transaction_policy_rule.description);
    this.showPolicyInfo = this.policyViolations?.length > 0 || this.criticalPolicyViolated;
  }

  async openPolicyViolationDetails() {
    const policyDetailsModal = await this.modalController.create({
      component: FyPolicyViolationComponent,
      componentProps: {
        policyViolationMessages: this.policyViolations,
        showComment: false,
        showCTA: false,
      },
      cssClass: 'payment-mode-modal',
      showBackdrop: true,
      swipeToClose: true,
      backdropDismiss: true,
      animated: true,
    });

    await policyDetailsModal.present();
  }
}
