import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ReportStates } from './report-states';
import {getCurrencySymbol} from '@angular/common';

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
  currencySymbol = '';

  @Output() badgeClicked = new EventEmitter();

  constructor(
  ) { }

  ngOnInit() {
    this.currencySymbol = getCurrencySymbol(this.currency, 'narrow');
  }

  onBadgeClicked() {
    this.badgeClicked.emit(this.reportState);
  }
}
