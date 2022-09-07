import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-auto-submission-info-card',
  templateUrl: './auto-submission-info-card.component.html',
  styleUrls: ['./auto-submission-info-card.component.scss'],
})
export class AutoSubmissionInfoCardComponent implements OnInit {
  @Input() autoSubmissionReportDate: Date;

  constructor() {}

  ngOnInit() {}
}
