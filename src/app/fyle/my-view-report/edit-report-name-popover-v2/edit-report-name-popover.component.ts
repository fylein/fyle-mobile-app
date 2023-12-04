import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-edit-report-name-popover-v2',
  templateUrl: './edit-report-name-popover.component.html',
  styleUrls: ['./edit-report-name-popover.component.scss'],
})
export class EditReportNamePopoverComponentV2 implements OnInit {
  @Input() reportName: string;

  constructor(private popoverController: PopoverController) {}

  ngOnInit(): void {}

  closePopover() {
    this.popoverController.dismiss();
  }

  saveReportName() {
    this.popoverController.dismiss({ reportName: this.reportName });
  }
}
