import { Injectable } from '@angular/core';
import { DriveStep } from 'driver.js';

@Injectable({
  providedIn: 'root',
})
export class WalkthroughService {
  activeWalkthroughIndex = 0;

  isOverlayClicked = true;

  getNavBarWalkthroughConfig(isApprover: boolean): DriveStep[] {
    const steps: DriveStep[] = [
      {
        element: '#footer-walkthrough',
        popover: {
          description:
            'Expenses & Reports are now on the bottom bar of the home page for easy access and smooth navigation!',
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
          description: 'Tap here to quickly access and manage your expenses!',
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
          description: 'Tap here to quickly access and manage your expense reports!',
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
          description: `Easily manage and approve reports — Access your team's reports right from the home page!`,
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
