import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-fy-critical-policy-violation',
  templateUrl: './fy-critical-policy-violation.component.html',
  styleUrls: ['./fy-critical-policy-violation.component.scss']
})
export class FyCriticalPolicyViolationComponent implements OnInit {
  @Input() criticalViolationMessages = [];

  constructor(private popoverController: PopoverController) {}

  ngOnInit() {}

  cancel() {
    this.popoverController.dismiss(false);
  }

  continue() {
    this.popoverController.dismiss(true);
  }
}
