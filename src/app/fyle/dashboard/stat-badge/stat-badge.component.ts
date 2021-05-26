import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { StatBadgeColors } from './stat-badge-colors';

@Component({
  selector: 'app-stat-badge',
  templateUrl: './stat-badge.component.html',
  styleUrls: ['./stat-badge.component.scss'],
})
export class StatBadgeComponent implements OnInit {

  @Input() color: StatBadgeColors;
  @Input() name: string;
  @Input() count = 0;
  @Input() value = 0;
  @Input() currency: string;

  @Output() badgeClicked = new EventEmitter();

  get StatBadgeColors() {
    return StatBadgeColors;
  }

  constructor(
  ) { }

  ngOnInit() {
  }

  onBadgeClicked() {
    this.badgeClicked.emit(this.name);
  }
}
