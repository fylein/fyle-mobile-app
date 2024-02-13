import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-fy-critical-policy-violation',
  templateUrl: './fy-critical-policy-violation.component.html',
  styleUrls: ['./fy-critical-policy-violation.component.scss'],
})
export class FyCriticalPolicyViolationComponent implements OnInit {
  @Input() criticalViolationMessages = [];

  @Input() showHeader = true;

  @Input() showCTA = true;

  @Input() showDragBar = true;

  @Input() showCloseIcon = false;

  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  cancel() {
    this.modalController.dismiss(false);
  }

  continue() {
    this.modalController.dismiss(true);
  }
}
