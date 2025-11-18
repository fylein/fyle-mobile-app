import { Component, OnInit, Input, ElementRef, inject, viewChild } from '@angular/core';
import { IonButton, IonButtons, IonHeader, IonTitle, IonToolbar, PopoverController } from '@ionic/angular/standalone';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-edit-report-name-popover',
  templateUrl: './edit-report-name-popover.component.html',
  styleUrls: ['./edit-report-name-popover.component.scss'],
  imports: [
    FormsModule,
    IonButton,
    IonButtons,
    IonHeader,
    IonTitle,
    IonToolbar,
    MatIcon,
    MatInput,
    TranslocoPipe
  ],
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
