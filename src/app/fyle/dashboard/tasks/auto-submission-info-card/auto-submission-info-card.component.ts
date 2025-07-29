import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-auto-submission-info-card',
  templateUrl: './auto-submission-info-card.component.html',
  styleUrls: ['./auto-submission-info-card.component.scss'],
  standalone: false,
})
export class AutoSubmissionInfoCardComponent implements OnInit {
  @Input() autoSubmissionReportDate: Date;

  @Output() cardClicked = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {}

  onCardClicked() {
    this.cardClicked.emit();
  }
}
