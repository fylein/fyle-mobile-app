import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-policy-violation-details',
  templateUrl: './policy-violation-details.component.html',
  styleUrls: ['./policy-violation-details.component.scss'],
})
export class PolicyViolationDetailsComponent implements OnInit {
  @Input() policyViolations;

  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  cancel() {
    this.modalController.dismiss();
  }
}
