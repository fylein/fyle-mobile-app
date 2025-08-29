import { Component, OnInit, Input, ElementRef, inject, viewChild } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-edit-report-name-popover',
  templateUrl: './edit-report-name-popover.component.html',
  styleUrls: ['./edit-report-name-popover.component.scss'],
  standalone: false,
})
export class EditReportNamePopoverComponent implements OnInit {
  private popoverController = inject(PopoverController);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() reportName: string;

  readonly reportNameInput = viewChild<ElementRef<HTMLInputElement>>('reportNameInput');

  ngOnInit(): void {
    setTimeout(() => {
      this.reportNameInput().nativeElement.focus();
    }, 100);
  }

  closePopover(): void {
    this.popoverController.dismiss();
  }

  saveReportName(): void {
    this.popoverController.dismiss({ reportName: this.reportName });
  }
}
