import { Injectable } from '@angular/core';
import { DriveStep } from 'driver.js';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class WalkthroughService {
  activeWalkthroughIndex = 0;

  isOverlayClicked = true;

  constructor(private translocoService: TranslocoService) {}

  getNavBarWalkthroughConfig(isApprover: boolean): DriveStep[] {
    const steps: DriveStep[] = [
      {
        element: '#footer-walkthrough',
        popover: {
          description: this.translocoService.translate('services.walkthrough.navBarDescription'),
          side: 'top',
          align: 'center',
          showButtons: ['next', 'close'],
        },
        onHighlightStarted: (_el, _step, opts): void => {
          opts.config.stagePadding = 10;
        },
      },
      {
        element: '#tab-button-expenses',
        popover: {
          description: this.translocoService.translate('services.walkthrough.expensesTabDescription'),
          side: 'top',
          align: 'start',
        },
        onHighlightStarted: (_el, _step, opts): void => {
          opts.config.stagePadding = 4;
        },
      },
      {
        element: '#tab-button-reports',
        popover: {
          description: this.translocoService.translate('services.walkthrough.reportsTabDescription'),
          side: 'top',
          align: 'end',
        },
        onHighlightStarted: (_el, _step, opts): void => {
          opts.config.stagePadding = 4;
        },
      },
    ];

    if (isApprover) {
      steps.push({
        element: '#approval-pending-stat',
        popover: {
          description: this.translocoService.translate('services.walkthrough.approverDescription'),
          side: 'top',
          align: 'center',
        },
        onHighlightStarted: (_el, _step, opts): void => {
          opts.config.stagePadding = 4;
        },
      });
    }

    return steps;
  }

  getProfileEmailOptInWalkthroughConfig(): DriveStep[] {
    const steps: DriveStep[] = [
      {
        element: '#profile-email-opt-in-walkthrough',
        popover: {
          description: this.translocoService.translate('services.walkthrough.profileEmailOptInDescription'),
          side: 'top',
          align: 'center',
        },
        onHighlightStarted: (_el, _step, opts): void => {
          opts.config.stagePadding = 4;
        },
      },
    ];

    return steps;
  }

  getActiveWalkthroughIndex(): number {
    return this.activeWalkthroughIndex;
  }

  setActiveWalkthroughIndex(index: number): void {
    this.activeWalkthroughIndex = index;
  }

  setIsOverlayClicked(isClicked: boolean): void {
    this.isOverlayClicked = isClicked;
  }

  getIsOverlayClicked(): boolean {
    return this.isOverlayClicked;
  }
}
