import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-autosubmission-info-card',
  templateUrl: './autosubmission-info-card.component.html',
  styleUrls: ['./autosubmission-info-card.component.scss'],
})
export class AutosubmissionInfoCardComponent implements OnInit {
  @Input() nextReportAutoSubmissionDate: Date;

  @Output() cardClicked = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {}
}
