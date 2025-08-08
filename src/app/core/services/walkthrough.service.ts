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

  getDashboardAddExpenseWalkthroughConfig(): DriveStep[] {
    const steps: DriveStep[] = [
      {
        element: '#dashboard-add-expense-button',
        popover: {
          description: this.translocoService.translate('services.walkthrough.dashboardAddExpenseDescription'),
          side: 'bottom',
          align: 'end',
        },
        onHighlightStarted: (_el, _step, opts): void => {
          opts.config.stagePadding = 4;
        },
      },
    ];

    return steps;
  }

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

  getMyExpensesBlockedFilterWalkthroughConfig(): DriveStep[] {
    const steps: DriveStep[] = [
      {
        element: '#blocked-filter-checkbox',
        popover: {
          description: this.translocoService.translate('services.walkthrough.blockedFilterDescription'),
          side: 'left',
          align: 'center',
          showButtons: ['close', 'next'],
        },
        onHighlightStarted: (_el, _step, opts): void => {
          opts.config.stagePadding = 6;
          opts.config.stageRadius = 8;
        },
      },
    ];

    return steps;
  }

  getMyExpensesBlockedStatusPillWalkthroughConfig(): DriveStep[] {
    const steps: DriveStep[] = [
      {
        element: '.expenses-card--state-container.state-blocked:nth-child(1)',
        popover: {
          description: this.translocoService.translate('services.walkthrough.blockedStatusPillDescription'),
          side: 'bottom',
          align: 'start',
          showButtons: ['close', 'next'],
        },
        onHighlightStarted: (_el, _step, opts): void => {
          opts.config.stagePadding = 6;
          opts.config.stageRadius = 8;
        },
      },
    ];

    return steps;
  }

  getMyExpensesIncompleteStatusPillWalkthroughConfig(): DriveStep[] {
    const steps: DriveStep[] = [
      {
        element: '.expenses-card--state-container.state-incomplete:nth-child(1)',
        popover: {
          description: this.translocoService.translate('services.walkthrough.incompleteStatusPillDescription'),
          side: 'bottom',
          align: 'start',
          showButtons: ['close', 'next'],
        },
        onHighlightStarted: (_el, _step, opts): void => {
          opts.config.stagePadding = 6;
          opts.config.stageRadius = 8;
        },
      },
    ];

    return steps;
  }

  getMyExpensesStatusPillSequenceWalkthroughConfig(): DriveStep[] {
    const steps: DriveStep[] = [
      {
        element: '.expenses-card--state-container.state-blocked',
        popover: {
          description: this.translocoService.translate('services.walkthrough.blockedStatusPillDescription'),
          side: 'bottom',
          align: 'start',
          showButtons: ['close', 'next'],
        },
        onHighlightStarted: (_el, _step, opts): void => {
          opts.config.stagePadding = 6;
          opts.config.stageRadius = 8;
        },
      },
      {
        element: '.expenses-card--state-container.state-incomplete',
        popover: {
          description: this.translocoService.translate('services.walkthrough.incompleteStatusPillDescription'),
          side: 'bottom',
          align: 'start',
          showButtons: ['close', 'next'],
        },
        onHighlightStarted: (_el, _step, opts): void => {
          opts.config.stagePadding = 6;
          opts.config.stageRadius = 8;
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
