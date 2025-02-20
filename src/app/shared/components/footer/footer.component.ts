import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { FooterState } from './footer-state';
import { NetworkService } from '../../../core/services/network.service';
import { ConnectionMessageStatus } from '../fy-connection/connection-status.enum';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-fy-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  @Output() homeClicked = new EventEmitter();

  @Output() cameraClicked = new EventEmitter();

  @Output() taskClicked = new EventEmitter();

  @Output() expensesClicked = new EventEmitter();

  @Output() reportsClicked = new EventEmitter();

  @Input() taskCount = 0;

  @Input() activeState: FooterState;

  connectionState$: Observable<ConnectionMessageStatus>;

  constructor(
    private networkService: NetworkService,
    private trackingService: TrackingService,
    private router: Router
  ) {}

  get ConnectionMessageStatus() {
    return ConnectionMessageStatus;
  }

  get FooterState() {
    return FooterState;
  }

  ngOnInit() {
    this.connectionState$ = this.networkService.getConnectionStatus();
  }

  goToHome() {
    console.log('FooterComponent -> goToHome -> this.router.url', this.router.url);
    this.trackingService.footerButtonClicked({
      Action: 'Home',
      Url: this.router.url,
    });

    this.homeClicked.emit();
  }

  goToCameraMode() {
    console.log('FooterComponent -> goToCameraMode -> this.router.url', this.router.url);
    this.trackingService.footerButtonClicked({
      Action: 'Camera',
      Url: this.router.url,
    });

    this.cameraClicked.emit();
  }

  goToExpenses() {
    console.log('FooterComponent -> goToExpenses -> this.router.url', this.router.url);
    this.trackingService.footerButtonClicked({
      Action: 'Expenses',
      Url: this.router.url,
    });

    this.expensesClicked.emit();
  }

  goToReports() {
    console.log('FooterComponent -> goToReports -> this.router.url', this.router.url);
    this.trackingService.footerButtonClicked({
      Action: 'Reports',
      Url: this.router.url,
    });

    this.reportsClicked.emit();
  }

  goToTasks(connectionState: ConnectionMessageStatus) {
    console.log('FooterComponent -> goToTasks -> this.router.url', this.router.url);
    if (connectionState !== ConnectionMessageStatus.disconnected) {
      this.trackingService.footerButtonClicked({
        Action: 'Tasks',
        Url: this.router.url,
      });

      this.taskClicked.emit();
    }
  }
}
