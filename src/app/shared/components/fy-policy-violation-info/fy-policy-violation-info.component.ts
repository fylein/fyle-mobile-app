import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PolicyViolationDetailsComponent } from '../policy-violation-details/policy-violation-details.component';

@Component({
  selector: 'app-fy-policy-violation-info',
  templateUrl: './fy-policy-violation-info.component.html',
  styleUrls: ['./fy-policy-violation-info.component.scss'],
})
export class FyPolicyViolationInfoComponent implements OnInit {
  @Input() estatuses;

  @Input() criticalPolicyViolated;

  @Input() duplicates;

  policyViolations;

  showPolicyInfo: boolean;

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.policyViolations = [];
    this.policyViolations = this.estatuses.filter((estatus) => estatus.st_org_user_id === 'POLICY');
    this.showPolicyInfo = this.policyViolations?.length > 0 || this.criticalPolicyViolated || this.duplicates?.length > 0;
  }

  async openPolicyViolationDetails() {
    const policyDetailsModal = await this.modalController.create({
      component: PolicyViolationDetailsComponent,
      componentProps: {
        policyViolations: this.policyViolations
      },
      cssClass: 'payment-mode-modal',
      showBackdrop: true,
      swipeToClose: true,
      backdropDismiss: true,
      animated: true
    });

    await policyDetailsModal.present();
  }
}
