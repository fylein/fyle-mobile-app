import { Component, Input, OnInit, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { FooterState } from './footer-state.enum';
import { NetworkService } from '../../../core/services/network.service';
import { ConnectionMessageStatus } from '../fy-connection/connection-status.enum';
import { Observable } from 'rxjs/internal/Observable';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { IonRippleEffect, IonTabButton } from '@ionic/angular/standalone';


@Component({
  selector: 'app-fy-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [
    AsyncPipe,
    IonRippleEffect,
    IonTabButton,
    MatIcon,
    MatRipple,
    NgClass,
    TranslocoPipe
  ],
})
export class FooterComponent implements OnInit {
  private networkService = inject(NetworkService);

  private trackingService = inject(TrackingService);

  private router = inject(Router);

  readonly homeClicked = output();

  readonly cameraClicked = output();

  readonly taskClicked = output();

  readonly expensesClicked = output();

  readonly reportsClicked = output();

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() taskCount = 0;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() activeState: FooterState;

  connectionState$: Observable<ConnectionMessageStatus>;

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
