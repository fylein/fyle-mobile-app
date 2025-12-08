import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { postVerificationRoutes } from './post-verification.routes';

describe('PostVerificationRoutes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
    });
  });

  it('should export routes array', () => {
    expect(postVerificationRoutes).toBeDefined();
    expect(Array.isArray(postVerificationRoutes)).toBeTrue();
  });

  it('should have all expected routes', () => {
    const expectedRoutes = ['invited_user'];

    expect(postVerificationRoutes.length).toBe(expectedRoutes.length);

    expectedRoutes.forEach((expectedPath) => {
      const route = postVerificationRoutes.find((r) => r.path === expectedPath);
      expect(route).toBeDefined();
    });
  });

  describe('Route configurations', () => {
    it('should have correct path for invited_user route', () => {
      const route = postVerificationRoutes.find((r) => r.path === 'invited_user');
      expect(route?.path).toBe('invited_user');
      expect(route?.loadComponent).toBeDefined();
    });
  });

  describe('LoadComponent configurations', () => {
    it('should have loadComponent function for invited_user route', () => {
      const route = postVerificationRoutes.find((r) => r.path === 'invited_user');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should execute loadComponent function for invited_user route', async () => {
      const route = postVerificationRoutes.find((r) => r.path === 'invited_user');
      expect(route?.loadComponent).toBeDefined();

      // Execute the dynamic import to get coverage
      const component = await route?.loadComponent?.();
      expect(component).toBeDefined();
    });

    it('should execute all loadComponent functions to achieve full coverage', async () => {
      // Execute all dynamic imports to get coverage for the import statements
      const loadComponentPromises = postVerificationRoutes.map(async (route) => {
        if (route.loadComponent) {
          const component = await route.loadComponent();
          expect(component).toBeDefined();
          return component;
        }
        return null;
      });

      const components = await Promise.all(loadComponentPromises);
      expect(components.filter(Boolean).length).toBe(postVerificationRoutes.length);
    });
  });

  describe('Guard configurations', () => {
    it('should not have guards on invited_user route', () => {
      const route = postVerificationRoutes.find((r) => r.path === 'invited_user');
      expect(route?.canActivate).toBeUndefined();
    });

    it('should have no routes protected by guards', () => {
      const protectedRoutes = postVerificationRoutes.filter(
        (route) => route.canActivate && route.canActivate.length > 0,
      );
      expect(protectedRoutes.length).toBe(0);
    });

    it('should have all routes without guards', () => {
      const unprotectedRoutes = postVerificationRoutes.filter(
        (route) => !route.canActivate || route.canActivate.length === 0,
      );
      expect(unprotectedRoutes.length).toBe(postVerificationRoutes.length);
    });
  });

  describe('Route structure validation', () => {
    it('should have all routes with required properties', () => {
      postVerificationRoutes.forEach((route) => {
        expect(route.path).toBeDefined();
        expect(route.loadComponent).toBeDefined();
      });
    });

    it('should not have duplicate paths', () => {
      const paths = postVerificationRoutes.map((route) => route.path);
      const uniquePaths = [...new Set(paths)];
      expect(paths.length).toBe(uniquePaths.length);
    });

    it('should have all paths as strings', () => {
      postVerificationRoutes.forEach((route) => {
        expect(typeof route.path).toBe('string');
        expect(route.path.length).toBeGreaterThan(0);
      });
    });

    it('should use snake_case for multi-word paths', () => {
      const multiWordRoutes = postVerificationRoutes.filter((route) => route.path && route.path.includes('_'));
      expect(multiWordRoutes.length).toBe(1);

      multiWordRoutes.forEach((route) => {
        expect(route.path).toMatch(/^[a-z_]+$/);
      });
    });

    it('should not use kebab-case in any path', () => {
      postVerificationRoutes.forEach((route) => {
        expect(route.path).not.toContain('-');
      });
    });

    it('should have all routes using loadComponent (not loadChildren)', () => {
      postVerificationRoutes.forEach((route) => {
        expect(route.loadComponent).toBeDefined();
        expect((route as { loadChildren?: unknown }).loadChildren).toBeUndefined();
      });
    });
  });

  describe('Route count validation', () => {
    it('should have exactly 1 route', () => {
      expect(postVerificationRoutes.length).toBe(1);
    });

    it('should have 1 lazy-loaded component route', () => {
      const lazyRoutes = postVerificationRoutes.filter((route) => route.loadComponent);
      expect(lazyRoutes.length).toBe(1);
    });

    it('should not have any redirect routes', () => {
      const redirectRoutes = postVerificationRoutes.filter((route) => (route as { redirectTo?: string }).redirectTo);
      expect(redirectRoutes.length).toBe(0);
    });

    it('should not have any module lazy loading routes', () => {
      const lazyModuleRoutes = postVerificationRoutes.filter(
        (route) => (route as { loadChildren?: unknown }).loadChildren,
      );
      expect(lazyModuleRoutes.length).toBe(0);
    });
  });

  describe('Path naming convention', () => {
    it('should have invited_user path in snake_case format', () => {
      const route = postVerificationRoutes.find((r) => r.path === 'invited_user');
      expect(route).toBeDefined();
      expect(route?.path).toBe('invited_user');
    });

    it('should not have any paths with uppercase letters', () => {
      postVerificationRoutes.forEach((route) => {
        expect(route.path).toBe(route.path.toLowerCase());
      });
    });

    it('should not have any paths with spaces', () => {
      postVerificationRoutes.forEach((route) => {
        expect(route.path).not.toContain(' ');
      });
    });
  });

  describe('Component lazy loading', () => {
    it('should lazy load InvitedUserPage component correctly', async () => {
      const route = postVerificationRoutes.find((r) => r.path === 'invited_user');
      const component = await route?.loadComponent?.();
      expect(component).toBeDefined();
    });
  });
});
