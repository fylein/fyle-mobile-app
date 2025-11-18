import { Component, OnInit, Input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-auto-submission-info-card',
  templateUrl: './auto-submission-info-card.component.html',
  styleUrls: ['./auto-submission-info-card.component.scss'],
  imports: [DatePipe, TranslocoPipe],
})
export class AutoSubmissionInfoCardComponent implements OnInit {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() autoSubmissionReportDate: Date;

  readonly cardClicked = output<void>();

  constructor() {}

  ngOnInit() {}

  onCardClicked() {
    // TODO: The 'emit' function requires a mandatory void argument
    this.cardClicked.emit();
  }
}
