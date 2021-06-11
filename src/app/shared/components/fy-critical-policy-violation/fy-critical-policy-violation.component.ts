import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-fy-critical-policy-violation',
  templateUrl: './fy-critical-policy-violation.component.html',
  styleUrls: ['./fy-critical-policy-violation.component.scss'],
})
export class FyCriticalPolicyViolationComponent implements OnInit {

  @Input() criticalViolationMessages = [];
  maximumPopoverHeight: string;
  minimumPopoverHeight: string;

  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    this.maximumPopoverHeight = window.innerHeight * 0.70 + 'px';
    this.minimumPopoverHeight = window.innerHeight * 0.45 + 'px';
  }

  cancel() {
    this.popoverController.dismiss(false);
  }

  continue() {
    this.popoverController.dismiss(true);
  }

}
