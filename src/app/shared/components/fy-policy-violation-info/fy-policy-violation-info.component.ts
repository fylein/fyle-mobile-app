import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FyPolicyViolationComponent } from '../fy-policy-violation/fy-policy-violation.component';
import { PolicyViolationDetailsComponent } from '../policy-violation-details/policy-violation-details.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';

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

  constructor(private modalController: ModalController, private modalProperties: ModalPropertiesService) {}

  ngOnInit() {
    this.policyViolations = [];
    this.policyViolations = this.policyDetails?.map((details) => details.transaction_policy_rule.description);
    this.showPolicyInfo = this.policyViolations?.length > 0 || this.criticalPolicyViolated;
  }

  async openPolicyViolationDetails() {
    const policyDetailsModal = await this.modalController.create({
      component: FyPolicyViolationComponent,
      componentProps: {
        policyViolations: this.policyViolations,
      },
      ...this.modalProperties.getModalDefaultProperties('payment-mode-modal'),
    });

    await policyDetailsModal.present();
  }
}
