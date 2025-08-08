import { TestBed } from '@angular/core/testing';
import { WalkthroughService } from './walkthrough.service';
import { DriveStep } from 'driver.js';
import { TranslocoService } from '@jsverse/transloco';

describe('WalkthroughDriverService', () => {
  let service: WalkthroughService;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    // Mock translate method to return expected strings
    translocoServiceSpy.translate.and.callFake((key: string) => {
      const translations: { [key: string]: string } = {
        'services.walkthrough.navBarDescription':
          'Expenses & Reports are now on the bottom bar of the home page for easy access and smooth navigation!',
        'services.walkthrough.expensesTabDescription': 'Tap here to quickly access and manage your expenses!',
        'services.walkthrough.reportsTabDescription': 'Tap here to quickly access and manage your expense reports!',
        'services.walkthrough.approverDescription':
          "Easily manage and approve reports — Access your team's reports right from the home page!",
        'services.walkthrough.blockedFilterDescription':
          'Filter blocked expenses that violate critical policy & cannot be submitted.',
        'services.walkthrough.dashboardAddExpenseDescription': 'Add a new expense from the dashboard',
        'services.walkthrough.profileEmailOptInDescription': 'Opt-in to receive email notifications',
        'services.walkthrough.blockedStatusPillDescription': 'This expense is blocked due to policy violations',
        'services.walkthrough.incompleteStatusPillDescription': 'This expense is incomplete and needs more information',
      };
      return translations[key] || key;
    });

    TestBed.configureTestingModule({
      providers: [
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    });
    service = TestBed.inject(WalkthroughService);
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return steps for non-approver', () => {
    const steps: DriveStep[] = service.getNavBarWalkthroughConfig(false);
    expect(steps.length).toBe(3);
    expect(steps[0].element).toBe('#footer-walkthrough');
    expect(steps[1].element).toBe('#tab-button-expenses');
    expect(steps[2].element).toBe('#tab-button-reports');
  });

  it('should return steps for approver', () => {
    const steps: DriveStep[] = service.getNavBarWalkthroughConfig(true);
    expect(steps.length).toBe(4);
    expect(steps[0].element).toBe('#footer-walkthrough');
    expect(steps[1].element).toBe('#tab-button-expenses');
    expect(steps[2].element).toBe('#tab-button-reports');
    expect(steps[3].element).toBe('#approval-pending-stat');
  });

  it('should have correct popover descriptions', () => {
    const steps: DriveStep[] = service.getNavBarWalkthroughConfig(true);
    expect(steps[0].popover.description).toBe(
      'Expenses & Reports are now on the bottom bar of the home page for easy access and smooth navigation!',
    );
    expect(steps[1].popover.description).toBe('Tap here to quickly access and manage your expenses!');
    expect(steps[2].popover.description).toBe('Tap here to quickly access and manage your expense reports!');
    expect(steps[3].popover.description).toBe(
      `Easily manage and approve reports — Access your team's reports right from the home page!`,
    );
  });

  describe('getMyExpensesBlockedFilterWalkthroughConfig', () => {
    it('should return blocked filter walkthrough steps', () => {
      const steps: DriveStep[] = service.getMyExpensesBlockedFilterWalkthroughConfig();

      expect(steps).toBeDefined();
      expect(steps.length).toBe(1);
    });

    it('should have correct element targeting for blocked filter', () => {
      const steps: DriveStep[] = service.getMyExpensesBlockedFilterWalkthroughConfig();

      expect(steps[0].element).toBe('#blocked-filter-checkbox');
    });

    it('should have correct popover configuration', () => {
      const steps: DriveStep[] = service.getMyExpensesBlockedFilterWalkthroughConfig();

      expect(steps[0].popover.description).toBe(
        'Filter blocked expenses that violate critical policy & cannot be submitted.',
      );
      expect(steps[0].popover.side).toBe('left');
      expect(steps[0].popover.align).toBe('center');
      expect(steps[0].popover.showButtons).toEqual(['close', 'next']);
    });

    it('should have correct onHighlightStarted configuration', () => {
      const steps: DriveStep[] = service.getMyExpensesBlockedFilterWalkthroughConfig();
      const mockOpts = {
        config: { stagePadding: 0, stageRadius: 0 },
        state: {} as any,
        driver: {} as any,
      };

      // Execute the onHighlightStarted callback
      steps[0].onHighlightStarted(null, null, mockOpts);

      expect(mockOpts.config.stagePadding).toBe(6);
      expect(mockOpts.config.stageRadius).toBe(8);
    });

    it('should call translate service with correct key', () => {
      service.getMyExpensesBlockedFilterWalkthroughConfig();

      expect(translocoService.translate).toHaveBeenCalledWith('services.walkthrough.blockedFilterDescription');
    });
  });

  describe('getDashboardAddExpenseWalkthroughConfig', () => {
    it('should return dashboard add expense walkthrough steps', () => {
      const steps: DriveStep[] = service.getDashboardAddExpenseWalkthroughConfig();

      expect(steps).toBeDefined();
      expect(steps.length).toBe(1);
    });

    it('should have correct element targeting for dashboard add expense', () => {
      const steps: DriveStep[] = service.getDashboardAddExpenseWalkthroughConfig();

      expect(steps[0].element).toBe('#dashboard-add-expense-button');
    });

    it('should have correct popover configuration', () => {
      const steps: DriveStep[] = service.getDashboardAddExpenseWalkthroughConfig();

      expect(steps[0].popover.side).toBe('bottom');
      expect(steps[0].popover.align).toBe('end');
    });

    it('should have correct onHighlightStarted configuration', () => {
      const steps: DriveStep[] = service.getDashboardAddExpenseWalkthroughConfig();
      const mockOpts = {
        config: { stagePadding: 0 },
        state: {} as any,
        driver: {} as any,
      };

      // Execute the onHighlightStarted callback
      steps[0].onHighlightStarted(null, null, mockOpts);

      expect(mockOpts.config.stagePadding).toBe(4);
    });

    it('should call translate service with correct key', () => {
      service.getDashboardAddExpenseWalkthroughConfig();

      expect(translocoService.translate).toHaveBeenCalledWith('services.walkthrough.dashboardAddExpenseDescription');
    });
  });

  describe('getProfileEmailOptInWalkthroughConfig', () => {
    it('should return profile email opt-in walkthrough steps', () => {
      const steps: DriveStep[] = service.getProfileEmailOptInWalkthroughConfig();

      expect(steps).toBeDefined();
      expect(steps.length).toBe(1);
    });

    it('should have correct element targeting for profile email opt-in', () => {
      const steps: DriveStep[] = service.getProfileEmailOptInWalkthroughConfig();

      expect(steps[0].element).toBe('#profile-email-opt-in-walkthrough');
    });

    it('should have correct popover configuration', () => {
      const steps: DriveStep[] = service.getProfileEmailOptInWalkthroughConfig();

      expect(steps[0].popover.side).toBe('top');
      expect(steps[0].popover.align).toBe('center');
    });

    it('should have correct onHighlightStarted configuration', () => {
      const steps: DriveStep[] = service.getProfileEmailOptInWalkthroughConfig();
      const mockOpts = {
        config: { stagePadding: 0 },
        state: {} as any,
        driver: {} as any,
      };

      // Execute the onHighlightStarted callback
      steps[0].onHighlightStarted(null, null, mockOpts);

      expect(mockOpts.config.stagePadding).toBe(4);
    });

    it('should call translate service with correct key', () => {
      service.getProfileEmailOptInWalkthroughConfig();

      expect(translocoService.translate).toHaveBeenCalledWith('services.walkthrough.profileEmailOptInDescription');
    });
  });

  describe('getMyExpensesStatusPillSequenceWalkthroughConfig', () => {
    it('should return status pill sequence walkthrough steps', () => {
      const steps: DriveStep[] = service.getMyExpensesStatusPillSequenceWalkthroughConfig();

      expect(steps).toBeDefined();
      expect(steps.length).toBe(2);
    });

    it('should have correct element targeting for blocked status pill', () => {
      const steps: DriveStep[] = service.getMyExpensesStatusPillSequenceWalkthroughConfig();

      expect(steps[0].element).toBe('.expenses-card--state-container.state-blocked');
    });

    it('should have correct element targeting for incomplete status pill', () => {
      const steps: DriveStep[] = service.getMyExpensesStatusPillSequenceWalkthroughConfig();

      expect(steps[1].element).toBe('.expenses-card--state-container.state-incomplete');
    });

    it('should have correct popover configuration for blocked status pill', () => {
      const steps: DriveStep[] = service.getMyExpensesStatusPillSequenceWalkthroughConfig();

      expect(steps[0].popover.description).toBe('This expense is blocked due to policy violations');
      expect(steps[0].popover.side).toBe('bottom');
      expect(steps[0].popover.align).toBe('start');
      expect(steps[0].popover.showButtons).toEqual(['close', 'next']);
    });

    it('should have correct popover configuration for incomplete status pill', () => {
      const steps: DriveStep[] = service.getMyExpensesStatusPillSequenceWalkthroughConfig();

      expect(steps[1].popover.description).toBe('This expense is incomplete and needs more information');
      expect(steps[1].popover.side).toBe('bottom');
      expect(steps[1].popover.align).toBe('start');
      expect(steps[1].popover.showButtons).toEqual(['close', 'next']);
    });

    it('should have correct onHighlightStarted configuration for both steps', () => {
      const steps: DriveStep[] = service.getMyExpensesStatusPillSequenceWalkthroughConfig();
      const mockOpts = {
        config: { stagePadding: 0, stageRadius: 0 },
        state: {} as any,
        driver: {} as any,
      };

      // Execute the onHighlightStarted callback for first step
      steps[0].onHighlightStarted(null, null, mockOpts);

      expect(mockOpts.config.stagePadding).toBe(6);
      expect(mockOpts.config.stageRadius).toBe(8);

      // Reset and test second step
      mockOpts.config.stagePadding = 0;
      mockOpts.config.stageRadius = 0;
      steps[1].onHighlightStarted(null, null, mockOpts);

      expect(mockOpts.config.stagePadding).toBe(6);
      expect(mockOpts.config.stageRadius).toBe(8);
    });

    it('should call translate service with correct keys', () => {
      service.getMyExpensesStatusPillSequenceWalkthroughConfig();

      expect(translocoService.translate).toHaveBeenCalledWith('services.walkthrough.blockedStatusPillDescription');
      expect(translocoService.translate).toHaveBeenCalledWith('services.walkthrough.incompleteStatusPillDescription');
    });
  });

  describe('getMyExpensesBlockedStatusPillWalkthroughConfig', () => {
    it('should return blocked status pill walkthrough steps', () => {
      const steps: DriveStep[] = service.getMyExpensesBlockedStatusPillWalkthroughConfig();

      expect(steps).toBeDefined();
      expect(steps.length).toBe(1);
    });

    it('should have correct element targeting for blocked status pill', () => {
      const steps: DriveStep[] = service.getMyExpensesBlockedStatusPillWalkthroughConfig();

      expect(steps[0].element).toBe('.expenses-card--state-container.state-blocked:nth-child(1)');
    });

    it('should have correct popover configuration', () => {
      const steps: DriveStep[] = service.getMyExpensesBlockedStatusPillWalkthroughConfig();

      expect(steps[0].popover.description).toBe('This expense is blocked due to policy violations');
      expect(steps[0].popover.side).toBe('bottom');
      expect(steps[0].popover.align).toBe('start');
      expect(steps[0].popover.showButtons).toEqual(['close', 'next']);
    });

    it('should have correct onHighlightStarted configuration', () => {
      const steps: DriveStep[] = service.getMyExpensesBlockedStatusPillWalkthroughConfig();
      const mockOpts = {
        config: { stagePadding: 0, stageRadius: 0 },
        state: {} as any,
        driver: {} as any,
      };

      // Execute the onHighlightStarted callback
      steps[0].onHighlightStarted(null, null, mockOpts);

      expect(mockOpts.config.stagePadding).toBe(6);
      expect(mockOpts.config.stageRadius).toBe(8);
    });

    it('should call translate service with correct key', () => {
      service.getMyExpensesBlockedStatusPillWalkthroughConfig();

      expect(translocoService.translate).toHaveBeenCalledWith('services.walkthrough.blockedStatusPillDescription');
    });
  });

  describe('getMyExpensesIncompleteStatusPillWalkthroughConfig', () => {
    it('should return incomplete status pill walkthrough steps', () => {
      const steps: DriveStep[] = service.getMyExpensesIncompleteStatusPillWalkthroughConfig();

      expect(steps).toBeDefined();
      expect(steps.length).toBe(1);
    });

    it('should have correct element targeting for incomplete status pill', () => {
      const steps: DriveStep[] = service.getMyExpensesIncompleteStatusPillWalkthroughConfig();

      expect(steps[0].element).toBe('.expenses-card--state-container.state-incomplete:nth-child(1)');
    });

    it('should have correct popover configuration', () => {
      const steps: DriveStep[] = service.getMyExpensesIncompleteStatusPillWalkthroughConfig();

      expect(steps[0].popover.description).toBe('This expense is incomplete and needs more information');
      expect(steps[0].popover.side).toBe('bottom');
      expect(steps[0].popover.align).toBe('start');
      expect(steps[0].popover.showButtons).toEqual(['close', 'next']);
    });

    it('should have correct onHighlightStarted configuration', () => {
      const steps: DriveStep[] = service.getMyExpensesIncompleteStatusPillWalkthroughConfig();
      const mockOpts = {
        config: { stagePadding: 0, stageRadius: 0 },
        state: {} as any,
        driver: {} as any,
      };

      // Execute the onHighlightStarted callback
      steps[0].onHighlightStarted(null, null, mockOpts);

      expect(mockOpts.config.stagePadding).toBe(6);
      expect(mockOpts.config.stageRadius).toBe(8);
    });

    it('should call translate service with correct key', () => {
      service.getMyExpensesIncompleteStatusPillWalkthroughConfig();

      expect(translocoService.translate).toHaveBeenCalledWith('services.walkthrough.incompleteStatusPillDescription');
    });
  });

  describe('State Management Methods', () => {
    it('should get and set active walkthrough index', () => {
      expect(service.getActiveWalkthroughIndex()).toBe(0);

      service.setActiveWalkthroughIndex(5);
      expect(service.getActiveWalkthroughIndex()).toBe(5);
    });

    it('should get and set overlay clicked state', () => {
      expect(service.getIsOverlayClicked()).toBeTrue();

      service.setIsOverlayClicked(false);
      expect(service.getIsOverlayClicked()).toBeFalse();

      service.setIsOverlayClicked(true);
      expect(service.getIsOverlayClicked()).toBeTrue();
    });
  });
});
