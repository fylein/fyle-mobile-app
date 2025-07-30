import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FyPolicyViolationComponent } from '../fy-policy-violation/fy-policy-violation.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { FyCriticalPolicyViolationComponent } from '../fy-critical-policy-violation/fy-critical-policy-violation.component';

interface PolicyDetail {
  run_status: string;
  expense_policy_rule?: {
    description: string;
  };
}

@Component({
  selector: 'app-fy-policy-violation-info',
  templateUrl: './fy-policy-violation-info.component.html',
  styleUrls: ['./fy-policy-violation-info.component.scss'],
  standalone: false,
})
export class FyPolicyViolationInfoComponent implements OnInit {
  @Input() policyDetails: PolicyDetail[] | undefined;

  @Input() criticalPolicyViolated: boolean | undefined;

  policyViolations: string[] = [];

  showPolicyInfo: boolean = false;

  constructor(
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
  ) {}

  ngOnInit(): void {
    this.policyViolations = [];
    if (this.policyDetails) {
      this.policyViolations = this.policyDetails
        .filter((ids: PolicyDetail) => ids.run_status === 'VIOLATED_ACTION_SUCCESS')
        .map((ids: PolicyDetail) => ids.expense_policy_rule?.description || '');
    }
    this.showPolicyInfo = this.policyViolations.length > 0 || !!this.criticalPolicyViolated;
  }

  async openPolicyViolationDetails(): Promise<void> {
    const componentProperties = this.criticalPolicyViolated
      ? { criticalViolationMessages: this.policyViolations, showCTA: false, showDragBar: false, showCloseIcon: true }
      : {
          policyViolationMessages: this.policyViolations,
          showComment: false,
          showCTA: false,
          showDragBar: false,
          showCloseIcon: true,
        };
    const policyDetailsModal = await this.modalController.create({
      component: this.criticalPolicyViolated ? FyCriticalPolicyViolationComponent : FyPolicyViolationComponent,
      componentProps: componentProperties,
      ...this.modalProperties.getModalDefaultProperties('auto-height'),
    });

    await policyDetailsModal.present();
  }
}
