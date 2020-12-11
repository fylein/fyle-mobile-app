import { Component, OnInit, Input, Output } from '@angular/core';
import { EventEmitter } from 'events';

@Component({
  selector: 'app-fy-zero-state',
  templateUrl: './fy-zero-state.component.html',
  styleUrls: ['./fy-zero-state.component.scss'],
})
export class FyZeroStateComponent implements OnInit {

  @Input() image: string;
  @Input() header: string;
  @Input() message: string;
  @Input() submessage: string;
  @Input() link: string;

  @Output() linkClicked = new EventEmitter();

  constructor() { }

  ngOnInit() {}

  onLinkClick(event) {
    this.linkClicked.emit(event);
  }
}
