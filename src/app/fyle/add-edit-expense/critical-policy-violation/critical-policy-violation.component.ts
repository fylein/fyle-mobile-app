import { Component, OnInit, Input } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-critical-policy-violation',
  templateUrl: './critical-policy-violation.component.html',
  styleUrls: ['./critical-policy-violation.component.scss'],
})
export class CriticalPolicyViolationComponent implements OnInit {

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
