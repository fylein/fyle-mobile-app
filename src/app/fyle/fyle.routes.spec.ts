import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OptInGuard } from '../core/guards/opt-in.guard';
import { OnboardingGuard } from '../core/guards/onboarding.guard';
import { fyleRoutes } from './fyle.routes';

describe('FyleRoutes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [OptInGuard, OnboardingGuard],
    });
  });

  it('should export routes array', () => {
    expect(fyleRoutes).toBeDefined();
    expect(Array.isArray(fyleRoutes)).toBeTrue();
  });

  it('should have all expected routes', () => {
    const expectedRoutes = [
      'my_dashboard',
      'my_expenses',
      'my_advances',
      'my_profile',
      'my_reports',
      'my_view_report',
      'help',
      'my_view_advance_request',
      'team_advance',
      'add_edit_expense',
      'spender_onboarding',
      'team_reports',
      'view_team_report',
      'my_view_advance',
      'delegated_accounts',
      'view_team_advance',
      'notifications',
      'my_create_report',
      'add_edit_per_diem',
      'add_edit_mileage',
      'add_edit_advance_request',
      'split_expense',
      'camera_overlay',
      'personal_cards_matched_expenses',
      'personal_cards',
      'view_expense',
      'view_mileage',
      'view_per_diem',
      'potential-duplicates',
      'merge_expense',
      'manage_corporate_cards',
    ];

    expect(fyleRoutes.length).toBe(expectedRoutes.length);

    expectedRoutes.forEach((expectedPath) => {
      const route = fyleRoutes.find((r) => r.path === expectedPath);
      expect(route).toBeDefined();
    });
  });

  describe('Route configurations', () => {
    it('should have correct path for my_dashboard route', () => {
      const route = fyleRoutes.find((r) => r.path === 'my_dashboard');
      expect(route?.path).toBe('my_dashboard');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for my_expenses route', () => {
      const route = fyleRoutes.find((r) => r.path === 'my_expenses');
      expect(route?.path).toBe('my_expenses');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for my_advances route', () => {
      const route = fyleRoutes.find((r) => r.path === 'my_advances');
      expect(route?.path).toBe('my_advances');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for my_profile route', () => {
      const route = fyleRoutes.find((r) => r.path === 'my_profile');
      expect(route?.path).toBe('my_profile');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for my_reports route', () => {
      const route = fyleRoutes.find((r) => r.path === 'my_reports');
      expect(route?.path).toBe('my_reports');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for my_view_report route', () => {
      const route = fyleRoutes.find((r) => r.path === 'my_view_report');
      expect(route?.path).toBe('my_view_report');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for help route', () => {
      const route = fyleRoutes.find((r) => r.path === 'help');
      expect(route?.path).toBe('help');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for my_view_advance_request route', () => {
      const route = fyleRoutes.find((r) => r.path === 'my_view_advance_request');
      expect(route?.path).toBe('my_view_advance_request');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for team_advance route', () => {
      const route = fyleRoutes.find((r) => r.path === 'team_advance');
      expect(route?.path).toBe('team_advance');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for add_edit_expense route', () => {
      const route = fyleRoutes.find((r) => r.path === 'add_edit_expense');
      expect(route?.path).toBe('add_edit_expense');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for spender_onboarding route', () => {
      const route = fyleRoutes.find((r) => r.path === 'spender_onboarding');
      expect(route?.path).toBe('spender_onboarding');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for team_reports route', () => {
      const route = fyleRoutes.find((r) => r.path === 'team_reports');
      expect(route?.path).toBe('team_reports');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for view_team_report route', () => {
      const route = fyleRoutes.find((r) => r.path === 'view_team_report');
      expect(route?.path).toBe('view_team_report');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for my_view_advance route', () => {
      const route = fyleRoutes.find((r) => r.path === 'my_view_advance');
      expect(route?.path).toBe('my_view_advance');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for delegated_accounts route', () => {
      const route = fyleRoutes.find((r) => r.path === 'delegated_accounts');
      expect(route?.path).toBe('delegated_accounts');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for view_team_advance route', () => {
      const route = fyleRoutes.find((r) => r.path === 'view_team_advance');
      expect(route?.path).toBe('view_team_advance');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for notifications route', () => {
      const route = fyleRoutes.find((r) => r.path === 'notifications');
      expect(route?.path).toBe('notifications');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for my_create_report route', () => {
      const route = fyleRoutes.find((r) => r.path === 'my_create_report');
      expect(route?.path).toBe('my_create_report');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for add_edit_per_diem route', () => {
      const route = fyleRoutes.find((r) => r.path === 'add_edit_per_diem');
      expect(route?.path).toBe('add_edit_per_diem');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for add_edit_mileage route', () => {
      const route = fyleRoutes.find((r) => r.path === 'add_edit_mileage');
      expect(route?.path).toBe('add_edit_mileage');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for add_edit_advance_request route', () => {
      const route = fyleRoutes.find((r) => r.path === 'add_edit_advance_request');
      expect(route?.path).toBe('add_edit_advance_request');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for split_expense route', () => {
      const route = fyleRoutes.find((r) => r.path === 'split_expense');
      expect(route?.path).toBe('split_expense');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for camera_overlay route', () => {
      const route = fyleRoutes.find((r) => r.path === 'camera_overlay');
      expect(route?.path).toBe('camera_overlay');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for personal_cards_matched_expenses route', () => {
      const route = fyleRoutes.find((r) => r.path === 'personal_cards_matched_expenses');
      expect(route?.path).toBe('personal_cards_matched_expenses');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for personal_cards route', () => {
      const route = fyleRoutes.find((r) => r.path === 'personal_cards');
      expect(route?.path).toBe('personal_cards');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for view_expense route', () => {
      const route = fyleRoutes.find((r) => r.path === 'view_expense');
      expect(route?.path).toBe('view_expense');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for view_mileage route', () => {
      const route = fyleRoutes.find((r) => r.path === 'view_mileage');
      expect(route?.path).toBe('view_mileage');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for view_per_diem route', () => {
      const route = fyleRoutes.find((r) => r.path === 'view_per_diem');
      expect(route?.path).toBe('view_per_diem');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for potential-duplicates route', () => {
      const route = fyleRoutes.find((r) => r.path === 'potential-duplicates');
      expect(route?.path).toBe('potential-duplicates');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for merge_expense route', () => {
      const route = fyleRoutes.find((r) => r.path === 'merge_expense');
      expect(route?.path).toBe('merge_expense');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for manage_corporate_cards route', () => {
      const route = fyleRoutes.find((r) => r.path === 'manage_corporate_cards');
      expect(route?.path).toBe('manage_corporate_cards');
      expect(route?.loadComponent).toBeDefined();
    });
  });

  describe('LoadComponent configurations', () => {
    it('should have loadComponent function for my_dashboard route', () => {
      const route = fyleRoutes.find((r) => r.path === 'my_dashboard');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should execute loadComponent function for my_dashboard route', async () => {
      const route = fyleRoutes.find((r) => r.path === 'my_dashboard');
      expect(route?.loadComponent).toBeDefined();

      // Execute the dynamic import to get coverage
      const component = await route?.loadComponent?.();
      expect(component).toBeDefined();
    });

    it('should execute all loadComponent functions to achieve full coverage', async () => {
      // Execute all dynamic imports to get coverage for the import statements
      const loadComponentPromises = fyleRoutes.map(async (route) => {
        if (route.loadComponent) {
          const component = await route.loadComponent();
          expect(component).toBeDefined();
          return component;
        }
        return null;
      });

      const components = await Promise.all(loadComponentPromises);
      expect(components.filter(Boolean).length).toBe(fyleRoutes.length);
    });

    it('should have loadComponent function for my_expenses route', () => {
      const route = fyleRoutes.find((r) => r.path === 'my_expenses');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for my_advances route', () => {
      const route = fyleRoutes.find((r) => r.path === 'my_advances');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for my_profile route', () => {
      const route = fyleRoutes.find((r) => r.path === 'my_profile');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for my_reports route', () => {
      const route = fyleRoutes.find((r) => r.path === 'my_reports');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for my_view_report route', () => {
      const route = fyleRoutes.find((r) => r.path === 'my_view_report');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for help route', () => {
      const route = fyleRoutes.find((r) => r.path === 'help');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for my_view_advance_request route', () => {
      const route = fyleRoutes.find((r) => r.path === 'my_view_advance_request');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for team_advance route', () => {
      const route = fyleRoutes.find((r) => r.path === 'team_advance');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for add_edit_expense route', () => {
      const route = fyleRoutes.find((r) => r.path === 'add_edit_expense');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for spender_onboarding route', () => {
      const route = fyleRoutes.find((r) => r.path === 'spender_onboarding');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for team_reports route', () => {
      const route = fyleRoutes.find((r) => r.path === 'team_reports');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for view_team_report route', () => {
      const route = fyleRoutes.find((r) => r.path === 'view_team_report');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for my_view_advance route', () => {
      const route = fyleRoutes.find((r) => r.path === 'my_view_advance');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for delegated_accounts route', () => {
      const route = fyleRoutes.find((r) => r.path === 'delegated_accounts');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for view_team_advance route', () => {
      const route = fyleRoutes.find((r) => r.path === 'view_team_advance');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for notifications route', () => {
      const route = fyleRoutes.find((r) => r.path === 'notifications');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for my_create_report route', () => {
      const route = fyleRoutes.find((r) => r.path === 'my_create_report');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for add_edit_per_diem route', () => {
      const route = fyleRoutes.find((r) => r.path === 'add_edit_per_diem');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for add_edit_mileage route', () => {
      const route = fyleRoutes.find((r) => r.path === 'add_edit_mileage');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for add_edit_advance_request route', () => {
      const route = fyleRoutes.find((r) => r.path === 'add_edit_advance_request');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for split_expense route', () => {
      const route = fyleRoutes.find((r) => r.path === 'split_expense');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for camera_overlay route', () => {
      const route = fyleRoutes.find((r) => r.path === 'camera_overlay');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for personal_cards_matched_expenses route', () => {
      const route = fyleRoutes.find((r) => r.path === 'personal_cards_matched_expenses');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for personal_cards route', () => {
      const route = fyleRoutes.find((r) => r.path === 'personal_cards');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for view_expense route', () => {
      const route = fyleRoutes.find((r) => r.path === 'view_expense');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for view_mileage route', () => {
      const route = fyleRoutes.find((r) => r.path === 'view_mileage');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for view_per_diem route', () => {
      const route = fyleRoutes.find((r) => r.path === 'view_per_diem');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for potential-duplicates route', () => {
      const route = fyleRoutes.find((r) => r.path === 'potential-duplicates');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for merge_expense route', () => {
      const route = fyleRoutes.find((r) => r.path === 'merge_expense');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for manage_corporate_cards route', () => {
      const route = fyleRoutes.find((r) => r.path === 'manage_corporate_cards');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });
  });

  describe('Guard configurations', () => {
    it('should have OptInGuard applied to all routes', () => {
      fyleRoutes.forEach((route) => {
        expect(route.canActivate).toBeDefined();
        expect(route.canActivate).toContain(OptInGuard);
      });
    });

    it('should have OnboardingGuard applied to my_dashboard route', () => {
      const route = fyleRoutes.find((r) => r.path === 'my_dashboard');
      expect(route?.canActivate).toBeDefined();
      expect(route?.canActivate).toContain(OnboardingGuard);
      expect(route?.canActivate).toContain(OptInGuard);
    });

    it('should have only OptInGuard applied to routes other than my_dashboard', () => {
      const routesWithoutOnboardingGuard = fyleRoutes.filter((route) => route.path !== 'my_dashboard');

      routesWithoutOnboardingGuard.forEach((route) => {
        expect(route.canActivate).toBeDefined();
        expect(route.canActivate).toContain(OptInGuard);
        expect(route.canActivate).not.toContain(OnboardingGuard);
      });
    });

    it('should have correct guard array length for my_dashboard route', () => {
      const route = fyleRoutes.find((r) => r.path === 'my_dashboard');
      expect(route?.canActivate?.length).toBe(2);
    });

    it('should have correct guard array length for routes other than my_dashboard', () => {
      const routesWithoutOnboardingGuard = fyleRoutes.filter((route) => route.path !== 'my_dashboard');

      routesWithoutOnboardingGuard.forEach((route) => {
        expect(route.canActivate?.length).toBe(1);
      });
    });
  });

  describe('Route structure validation', () => {
    it('should have all routes with required properties', () => {
      fyleRoutes.forEach((route) => {
        expect(route.path).toBeDefined();
        expect(route.loadComponent).toBeDefined();
        expect(route.canActivate).toBeDefined();
        expect(Array.isArray(route.canActivate)).toBeTrue();
      });
    });

    it('should not have duplicate paths', () => {
      const paths = fyleRoutes.map((route) => route.path);
      const uniquePaths = [...new Set(paths)];
      expect(paths.length).toBe(uniquePaths.length);
    });

    it('should have all paths as strings', () => {
      fyleRoutes.forEach((route) => {
        expect(typeof route.path).toBe('string');
        expect(route.path.length).toBeGreaterThan(0);
      });
    });
  });
});
