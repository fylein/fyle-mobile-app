import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-critical-policy-violation',
  templateUrl: './critical-policy-violation.component.html',
  styleUrls: ['./critical-policy-violation.component.scss'],
})
export class CriticalPolicyViolationComponent implements OnInit {

  @Input() criticalViolationMessages = [];

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {}

  cancel() {
    this.modalController.dismiss(false);
  }

  continue() {
    this.modalController.dismiss(true);
  }
}
