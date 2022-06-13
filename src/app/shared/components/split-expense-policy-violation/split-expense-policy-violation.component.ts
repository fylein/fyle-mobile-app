import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { from } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { StatusService } from 'src/app/core/services/status.service';

@Component({
  selector: 'app-split-expense-policy-violation',
  templateUrl: './split-expense-policy-violation.component.html',
  styleUrls: ['./split-expense-policy-violation.component.scss'],
})
export class SplitExpensePolicyViolationComponent implements OnInit {
  @Input() policyViolations: any;

  transactionIDs = [];

  comments = {};

  defaultPolicyViolationMessage = 'No policy violation explanation provided';

  prependPolicyViolationMessage = 'Policy violation explanation: ';

  constructor(private modalController: ModalController, private statusService: StatusService) {}

  ngOnInit() {
    if (this.policyViolations) {
      Object.keys(this.policyViolations).forEach((transactionsID) => {
        this.comments[transactionsID] = '';
        this.transactionIDs.push(transactionsID);
      });
    }
  }

  toggleExpansion(currentTransactionID) {
    this.transactionIDs.forEach((transactionID) => {
      if (transactionID !== currentTransactionID) {
        this.policyViolations[transactionID].isExpanded = false;
      }
    });
    this.policyViolations[currentTransactionID].isExpanded = !this.policyViolations[currentTransactionID].isExpanded;
  }

  cancel() {
    this.modalController.dismiss();
  }

  postComment(apiPayload) {
    return this.statusService
      .post(apiPayload.objectType, apiPayload.txnId, apiPayload.comment, apiPayload.notify)
      .pipe(map((res) => res));
  }

  continue() {
    const payloadData = [];
    this.transactionIDs.forEach((transactionID) => {
      const comment =
        this.comments[transactionID] && this.comments[transactionID] !== ''
          ? this.prependPolicyViolationMessage + this.comments[transactionID]
          : this.defaultPolicyViolationMessage;
      const apiPayload = {
        objectType: 'transactions',
        txnId: transactionID,
        comment: { comment },
        notify: true,
      };
      payloadData.push(apiPayload);
    });

    from(payloadData)
      .pipe(concatMap((payload) => this.postComment(payload)))
      .subscribe((res) => {
        this.modalController.dismiss();
      });
  }
}
