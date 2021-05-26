import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {FooterState} from './footer-state';

@Component({
  selector: 'app-fy-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {

  @Output() homeClicked = new EventEmitter();
  @Output() cameraClicked = new EventEmitter();
  @Output() taskClicked = new EventEmitter();

  @Input() activeState: FooterState;

  get FooterState() {
    return FooterState;
  }

  constructor() { }

  ngOnInit() {}

  onHomeClick() {
    this.homeClicked.emit();
  }

  onCameraClick() {
    this.cameraClicked.emit();
  }

  onTasksClick() {
    this.taskClicked.emit();
  }
}
