import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ReportStates } from './report-states';
import { HostListener } from '@angular/core';

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

  @Input() currencySymbol: string;

  @Input() loading = false;

  @Input() expenseState: string;

  @Output() badgeClicked = new EventEmitter();

  // To track if the screen is small (360px or below)
  isSmallScreen = false;

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.isSmallScreen = window.innerWidth <= 360;
  }

  onBadgeClicked(): void {
    if (!this.loading) {
      this.badgeClicked.emit(this.reportState);
      if (this.expenseState) {
        this.badgeClicked.emit(this.expenseState);
      }
    }
  }

  ngOnInit(): void {
    this.isSmallScreen = window.innerWidth <= 360;
  }
}
