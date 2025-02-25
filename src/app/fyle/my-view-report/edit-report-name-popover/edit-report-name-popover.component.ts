import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-edit-report-name-popover',
  templateUrl: './edit-report-name-popover.component.html',
  styleUrls: ['./edit-report-name-popover.component.scss'],
})
export class EditReportNamePopoverComponent implements OnInit {
  @Input() reportName: string;

  @ViewChild('reportNameInput') reportNameInput: ElementRef<HTMLInputElement>;

  constructor(private popoverController: PopoverController) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.reportNameInput.nativeElement.focus();
    }, 100);
  }

  closePopover(): void {
    this.popoverController.dismiss();
  }

  saveReportName(): void {
    this.popoverController.dismiss({ reportName: this.reportName });
  }
}
