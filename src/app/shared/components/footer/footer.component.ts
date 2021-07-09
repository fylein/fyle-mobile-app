import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TrackingService } from 'src/app/core/services/tracking.service';
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

  constructor(
    private trackingService: TrackingService,
    private router: Router
  ) { }

  ngOnInit() {}

  goToHome() {
    this.trackingService.footerButtonClicked({
      Asset: 'Mobile',
      Action: 'Home',
      Url: this.router.url
    });

    this.homeClicked.emit();
  }

  goToCameraMode() {
    this.trackingService.footerButtonClicked({
      Asset: 'Mobile',
      Action: 'Camera',
      Url: this.router.url
    });

    this.cameraClicked.emit();
  }

  goToTasks() {
    this.trackingService.footerButtonClicked({
      Asset: 'Mobile',
      Action: 'Tasks',
      Url: this.router.url
    });

    this.taskClicked.emit();
  }
}
