import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-policy-violation-dialog',
  templateUrl: './policy-violation-dialog.component.html',
  styleUrls: ['./policy-violation-dialog.component.scss'],
})
export class PolicyViolationDialogComponent implements OnInit {

  @Input() violatedPolicyRules: string[];
  @Input() policyViolationActionDescription: string;
  newComment: string;

  constructor(
    private modalController: ModalController
  ) { }


  closePolicyModal() {
    this.modalController.dismiss();
  }

  continueWithPolicyViolation() {
    this.modalController.dismiss({
      reason: this.newComment
    })
  }

  ngOnInit() {
  }

}
