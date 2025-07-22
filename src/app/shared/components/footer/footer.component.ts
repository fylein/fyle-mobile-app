import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { FooterState } from './footer-state.enum';
import { NetworkService } from '../../../core/services/network.service';
import { ConnectionMessageStatus } from '../fy-connection/connection-status.enum';
import { Observable } from 'rxjs/internal/Observable';
import { NgClass, AsyncPipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [NgClass, IonicModule, MatIcon, MatRipple, AsyncPipe, TranslocoPipe],
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

  get ConnectionMessageStatus(): typeof ConnectionMessageStatus {
    return ConnectionMessageStatus;
  }

  get FooterState(): typeof FooterState {
    return FooterState;
  }

  ngOnInit(): void {
    this.connectionState$ = this.networkService.getConnectionStatus();
  }

  goToHome(): void {
    this.trackingService.footerButtonClicked({
      Action: 'Home',
      Url: this.router.url,
    });

    this.homeClicked.emit();
  }

  goToCameraMode(): void {
    this.trackingService.footerButtonClicked({
      Action: 'Camera',
      Url: this.router.url,
    });

    this.cameraClicked.emit();
  }

  goToExpenses(): void {
    this.trackingService.footerButtonClicked({
      Action: 'Expenses',
      Url: this.router.url,
    });

    this.expensesClicked.emit();
  }

  goToReports(): void {
    this.trackingService.footerButtonClicked({
      Action: 'Reports',
      Url: this.router.url,
    });

    this.reportsClicked.emit();
  }

  goToTasks(connectionState: ConnectionMessageStatus): void {
    if (connectionState !== ConnectionMessageStatus.disconnected) {
      this.trackingService.footerButtonClicked({
        Action: 'Tasks',
        Url: this.router.url,
      });

      this.taskClicked.emit();
    }
  }
}
