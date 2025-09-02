import { Component, OnInit, Input, output } from '@angular/core';

@Component({
  selector: 'app-auto-submission-info-card',
  templateUrl: './auto-submission-info-card.component.html',
  styleUrls: ['./auto-submission-info-card.component.scss'],
  standalone: false,
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
