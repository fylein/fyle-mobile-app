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
      'Expenses & Reports are now on the bottom bar of the home page for easy access and smooth navigation!'
    );
    expect(steps[1].popover.description).toBe('Tap here to quickly access and manage your expenses!');
    expect(steps[2].popover.description).toBe('Tap here to quickly access and manage your expense reports!');
    expect(steps[3].popover.description).toBe(
      `Easily manage and approve reports — Access your team's reports right from the home page!`
    );
  });
});
