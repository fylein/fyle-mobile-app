import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthGuard } from '../core/guards/auth.guard';
import { authRoutes } from './auth.routes';

describe('AuthRoutes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AuthGuard],
    });
  });

  it('should export routes array', () => {
    expect(authRoutes).toBeDefined();
    expect(Array.isArray(authRoutes)).toBeTrue();
  });

  it('should have all expected routes', () => {
    const expectedRoutes = [
      'sign_in',
      'switch_org',
      'app_version',
      'reset_password',
      'verify',
      'new_password',
      'disabled',
      'pending_verification',
    ];

    expect(authRoutes.length).toBe(expectedRoutes.length);

    expectedRoutes.forEach((expectedPath) => {
      const route = authRoutes.find((r) => r.path === expectedPath);
      expect(route).toBeDefined();
    });
  });

  describe('Route configurations', () => {
    it('should have correct path for sign_in route', () => {
      const route = authRoutes.find((r) => r.path === 'sign_in');
      expect(route?.path).toBe('sign_in');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for switch_org route', () => {
      const route = authRoutes.find((r) => r.path === 'switch_org');
      expect(route?.path).toBe('switch_org');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for app_version route', () => {
      const route = authRoutes.find((r) => r.path === 'app_version');
      expect(route?.path).toBe('app_version');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for reset_password route', () => {
      const route = authRoutes.find((r) => r.path === 'reset_password');
      expect(route?.path).toBe('reset_password');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for verify route', () => {
      const route = authRoutes.find((r) => r.path === 'verify');
      expect(route?.path).toBe('verify');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for new_password route', () => {
      const route = authRoutes.find((r) => r.path === 'new_password');
      expect(route?.path).toBe('new_password');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for disabled route', () => {
      const route = authRoutes.find((r) => r.path === 'disabled');
      expect(route?.path).toBe('disabled');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have correct path for pending_verification route', () => {
      const route = authRoutes.find((r) => r.path === 'pending_verification');
      expect(route?.path).toBe('pending_verification');
      expect(route?.loadComponent).toBeDefined();
    });
  });

  describe('LoadComponent configurations', () => {
    it('should have loadComponent function for sign_in route', () => {
      const route = authRoutes.find((r) => r.path === 'sign_in');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should execute loadComponent function for sign_in route', async () => {
      const route = authRoutes.find((r) => r.path === 'sign_in');
      expect(route?.loadComponent).toBeDefined();

      // Execute the dynamic import to get coverage
      const component = await route?.loadComponent?.();
      expect(component).toBeDefined();
    });

    it('should execute all loadComponent functions to achieve full coverage', async () => {
      // Execute all dynamic imports to get coverage for the import statements
      const loadComponentPromises = authRoutes.map(async (route) => {
        if (route.loadComponent) {
          const component = await route.loadComponent();
          expect(component).toBeDefined();
          return component;
        }
        return null;
      });

      const components = await Promise.all(loadComponentPromises);
      expect(components.filter(Boolean).length).toBe(authRoutes.length);
    });

    it('should have loadComponent function for switch_org route', () => {
      const route = authRoutes.find((r) => r.path === 'switch_org');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for app_version route', () => {
      const route = authRoutes.find((r) => r.path === 'app_version');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for reset_password route', () => {
      const route = authRoutes.find((r) => r.path === 'reset_password');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for verify route', () => {
      const route = authRoutes.find((r) => r.path === 'verify');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for new_password route', () => {
      const route = authRoutes.find((r) => r.path === 'new_password');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for disabled route', () => {
      const route = authRoutes.find((r) => r.path === 'disabled');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should have loadComponent function for pending_verification route', () => {
      const route = authRoutes.find((r) => r.path === 'pending_verification');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });
  });

  describe('Guard configurations', () => {
    it('should have AuthGuard applied to switch_org route', () => {
      const route = authRoutes.find((r) => r.path === 'switch_org');
      expect(route?.canActivate).toBeDefined();
      expect(route?.canActivate).toContain(AuthGuard);
    });

    it('should have only AuthGuard on switch_org route', () => {
      const route = authRoutes.find((r) => r.path === 'switch_org');
      expect(route?.canActivate?.length).toBe(1);
      expect(route?.canActivate?.[0]).toBe(AuthGuard);
    });

    it('should not have guards on sign_in route', () => {
      const route = authRoutes.find((r) => r.path === 'sign_in');
      expect(route?.canActivate).toBeUndefined();
    });

    it('should not have guards on app_version route', () => {
      const route = authRoutes.find((r) => r.path === 'app_version');
      expect(route?.canActivate).toBeUndefined();
    });

    it('should not have guards on reset_password route', () => {
      const route = authRoutes.find((r) => r.path === 'reset_password');
      expect(route?.canActivate).toBeUndefined();
    });

    it('should not have guards on verify route', () => {
      const route = authRoutes.find((r) => r.path === 'verify');
      expect(route?.canActivate).toBeUndefined();
    });

    it('should not have guards on new_password route', () => {
      const route = authRoutes.find((r) => r.path === 'new_password');
      expect(route?.canActivate).toBeUndefined();
    });

    it('should not have guards on disabled route', () => {
      const route = authRoutes.find((r) => r.path === 'disabled');
      expect(route?.canActivate).toBeUndefined();
    });

    it('should not have guards on pending_verification route', () => {
      const route = authRoutes.find((r) => r.path === 'pending_verification');
      expect(route?.canActivate).toBeUndefined();
    });

    it('should have exactly 1 route protected by guards', () => {
      const protectedRoutes = authRoutes.filter((route) => route.canActivate && route.canActivate.length > 0);
      expect(protectedRoutes.length).toBe(1);
      expect(protectedRoutes[0].path).toBe('switch_org');
    });

    it('should have exactly 7 routes without guards', () => {
      const unprotectedRoutes = authRoutes.filter((route) => !route.canActivate || route.canActivate.length === 0);
      expect(unprotectedRoutes.length).toBe(7);
    });
  });

  describe('Route structure validation', () => {
    it('should have all routes with required properties', () => {
      authRoutes.forEach((route) => {
        expect(route.path).toBeDefined();
        expect(route.loadComponent).toBeDefined();
      });
    });

    it('should not have duplicate paths', () => {
      const paths = authRoutes.map((route) => route.path);
      const uniquePaths = [...new Set(paths)];
      expect(paths.length).toBe(uniquePaths.length);
    });

    it('should have all paths as strings', () => {
      authRoutes.forEach((route) => {
        expect(typeof route.path).toBe('string');
        expect(route.path.length).toBeGreaterThan(0);
      });
    });

    it('should use snake_case for multi-word paths', () => {
      const multiWordRoutes = authRoutes.filter((route) => route.path && route.path.includes('_'));
      expect(multiWordRoutes.length).toBeGreaterThan(0);

      multiWordRoutes.forEach((route) => {
        expect(route.path).toMatch(/^[a-z_]+$/);
      });
    });

    it('should not use kebab-case in any path', () => {
      authRoutes.forEach((route) => {
        expect(route.path).not.toContain('-');
      });
    });

    it('should have all routes using loadComponent (not loadChildren)', () => {
      authRoutes.forEach((route) => {
        expect(route.loadComponent).toBeDefined();
        expect((route as { loadChildren?: unknown }).loadChildren).toBeUndefined();
      });
    });
  });

  describe('Route count validation', () => {
    it('should have exactly 8 routes', () => {
      expect(authRoutes.length).toBe(8);
    });
  });

  describe('Path naming convention', () => {
    it('should have all paths in snake_case format', () => {
      const expectedPaths = [
        'sign_in',
        'switch_org',
        'app_version',
        'reset_password',
        'verify',
        'new_password',
        'disabled',
        'pending_verification',
      ];

      authRoutes.forEach((route) => {
        expect(expectedPaths).toContain(route.path);
      });
    });

    it('should not have any paths with uppercase letters', () => {
      authRoutes.forEach((route) => {
        expect(route.path).toBe(route.path.toLowerCase());
      });
    });

    it('should not have any paths with spaces', () => {
      authRoutes.forEach((route) => {
        expect(route.path).not.toContain(' ');
      });
    });
  });
});
