import { TestBed } from '@angular/core/testing';
import { WalkthroughService } from './walkthrough.service';
import { DriveStep } from 'driver.js';

describe('WalkthroughDriverService', () => {
  let service: WalkthroughService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WalkthroughService);
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
      'Expenses & Reports are now on the bottom bar of the home page for easy access and smooth navigation!'
    );
    expect(steps[1].popover.description).toBe('Tap here to quickly access and manage your expenses!');
    expect(steps[2].popover.description).toBe('Tap here to quickly access and manage your expense reports!');
    expect(steps[3].popover.description).toBe(
      `Easily manage and approve reports — Access your team's reports right from the home page!`
    );
  });
});
