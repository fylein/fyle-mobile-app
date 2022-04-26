import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-fy-policy-violation',
  templateUrl: './fy-policy-violation.component.html',
  styleUrls: ['./fy-policy-violation.component.scss'],
})
export class FyPolicyViolationComponent implements OnInit {
  @Input() policyViolationMessages = [];

  @Input() policyActionDescription = '';

  @Input() comment = '';

  isExpenseFlagged: boolean;

  isPrimaryApproverSkipped: boolean;

  needAdditionalApproval: boolean;

  isExpenseCapped: boolean;

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.policyViolationMessages = [
      'Sentence1 of the fortst sdfkjsdf sdf sdf sdf sdfsdf sdf,\n asdsadasdasdasdsad \n sdssfsd \n sdfsfdsf \n asdasdasd \n sdfsdfsdfdsf',
      'sdfds fsdf werui sdifsdfuoisf  sdifus  oisdufu iudfo fusdof usdof osd fuos fosdufos fosdu fsd',
      'sdfdsf sdf sdf sdf sdf sdfsdf sdf sdf sdf sdf sdf sdf sdf sdf sdf dsf dsf sdf sdf sd fsdf sd fsdf sd fsd fsd fsd fsd fsd',
      'sdf s  s dfsd fsd fsd f',
      'sdfsdf  fs sf sdfsdf f sd fs s fsdf sd fsd fsd fsdf ',
    ];

    this.policyActionDescription =
      'The policy violation will trigger the following action(s): expense will be flagged for verification and approval, primary approver will be skipped, expense will need additional approval from dimple.kh@fyle.in, aiyush.dhar@fyle.in, expense will be capped to USD 10';

    if (this.policyActionDescription) {
      if (this.policyActionDescription.toLowerCase().includes('expense will be flagged')) {
        this.isExpenseFlagged = true;
      }
      if (this.policyActionDescription.toLowerCase().includes('primary approver will be skipped')) {
        this.isPrimaryApproverSkipped = true;
      }
      if (this.policyActionDescription.toLowerCase().includes('expense will need additional approval from')) {
        this.needAdditionalApproval = true;
      }
      if (this.policyActionDescription.toLowerCase().includes('expense will be capped to')) {
        this.isExpenseCapped = true;
      }
    }
  }

  cancel() {
    this.modalController.dismiss();
  }

  continue() {
    this.modalController.dismiss({
      comment: this.comment,
    });
  }
}
