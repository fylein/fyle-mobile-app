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

  newStatusPillWalkthrough(expenses: any[]): DriveStep[] {
    const steps: DriveStep[] = [];
    
    // Check if there are incomplete expenses (DRAFT state)
    const hasIncompleteExpenses = expenses.some(expense => expense.state === 'DRAFT');
    if (hasIncompleteExpenses) {
      // Find the first incomplete expense
      const firstIncompleteExpense = expenses.find(expense => expense.state === 'DRAFT');
      if (firstIncompleteExpense) {
        steps.push({
          element: `#expense-state-pill-${firstIncompleteExpense.id}`,
          popover: {
            description: this.translocoService.translate('services.walkthrough.incompleteExpenseDescription'),
            side: 'bottom',
            align: 'center',
            showButtons: ['next', 'close'],
          },
          onHighlightStarted: (el, _step, opts): void => {
            opts.config.stagePadding = 10;
            // Scroll the element into view if needed
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
              // Add a longer delay to ensure scrolling completes and positioning is stable
              setTimeout(() => {
                // Force repositioning after scroll
                if (opts && opts.config) {
                  opts.config.stagePadding = 10;
                }
              }, 500);
            }
          },
          onHighlighted: (el, _step, opts): void => {
            // Ensure proper positioning after highlighting
            if (opts && opts.config) {
              opts.config.stagePadding = 10;
            }
          },
        });
      }
    }
    
    // Check if there are blocked expenses (UNREPORTABLE state)
    const hasBlockedExpenses = expenses.some(expense => expense.state === 'UNREPORTABLE');
    if (hasBlockedExpenses) {
      // Find the first blocked expense
      const firstBlockedExpense = expenses.find(expense => expense.state === 'UNREPORTABLE');
      if (firstBlockedExpense) {
        steps.push({
          element: `#expense-state-pill-${firstBlockedExpense.id}`,
          popover: {
            description: this.translocoService.translate('services.walkthrough.blockedExpenseDescription'),
            side: 'bottom',
            align: 'center',
            showButtons: ['next', 'close'],
          },
          onHighlightStarted: (el, _step, opts): void => {
            opts.config.stagePadding = 10;
            // Scroll the element into view if needed
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
              // Add a longer delay to ensure scrolling completes and positioning is stable
              setTimeout(() => {
                // Force repositioning after scroll
                if (opts && opts.config) {
                  opts.config.stagePadding = 10;
                }
              }, 500);
            }
          },
          onHighlighted: (el, _step, opts): void => {
            // Ensure proper positioning after highlighting
            if (opts && opts.config) {
              opts.config.stagePadding = 10;
            }
          },
        });
      }
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
