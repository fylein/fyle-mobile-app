import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ReportStates } from './report-states';

@Component({
  selector: 'app-stat-badge',
  templateUrl: './stat-badge.component.html',
  styleUrls: ['./stat-badge.component.scss'],
})
export class StatBadgeComponent implements OnInit {

  @Input() reportState: ReportStates;
  @Input() name: string;
  @Input() count = 0;
  @Input() value = 0;
  @Input() currency: string;
  @Input() loading = false;

  @Output() badgeClicked = new EventEmitter();

  constructor(
  ) { }

  ngOnInit() {
  }

  onBadgeClicked() {
    this.badgeClicked.emit(this.reportState);
  }
}
