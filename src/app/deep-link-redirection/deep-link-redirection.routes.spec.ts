import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { deepLinkRedirectionRoutes } from './deep-link-redirection.routes';

describe('DeepLinkRedirectionRoutes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
    });
  });

  it('should export routes array', () => {
    expect(deepLinkRedirectionRoutes).toBeDefined();
    expect(Array.isArray(deepLinkRedirectionRoutes)).toBeTrue();
  });

  it('should have all expected routes', () => {
    const expectedRoutes = [''];

    expect(deepLinkRedirectionRoutes.length).toBe(expectedRoutes.length);

    expectedRoutes.forEach((expectedPath) => {
      const route = deepLinkRedirectionRoutes.find((r) => r.path === expectedPath);
      expect(route).toBeDefined();
    });
  });

  describe('Route configurations', () => {
    it('should have correct path for root route', () => {
      const route = deepLinkRedirectionRoutes.find((r) => r.path === '');
      expect(route?.path).toBe('');
      expect(route?.loadComponent).toBeDefined();
    });

    it('should have empty string as path (default route)', () => {
      const route = deepLinkRedirectionRoutes[0];
      expect(route.path).toBe('');
    });
  });

  describe('LoadComponent configurations', () => {
    it('should have loadComponent function for root route', () => {
      const route = deepLinkRedirectionRoutes.find((r) => r.path === '');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });

    it('should execute loadComponent function for root route', async () => {
      const route = deepLinkRedirectionRoutes.find((r) => r.path === '');
      expect(route?.loadComponent).toBeDefined();

      // Execute the dynamic import to get coverage
      const component = await route?.loadComponent?.();
      expect(component).toBeDefined();
    });

    it('should execute all loadComponent functions to achieve full coverage', async () => {
      // Execute all dynamic imports to get coverage for the import statements
      const loadComponentPromises = deepLinkRedirectionRoutes.map(async (route) => {
        if (route.loadComponent) {
          const component = await route.loadComponent();
          expect(component).toBeDefined();
          return component;
        }
        return null;
      });

      const components = await Promise.all(loadComponentPromises);
      expect(components.filter(Boolean).length).toBe(deepLinkRedirectionRoutes.length);
    });
  });

  describe('Guard configurations', () => {
    it('should not have guards on root route', () => {
      const route = deepLinkRedirectionRoutes.find((r) => r.path === '');
      expect(route?.canActivate).toBeUndefined();
    });

    it('should have no routes protected by guards', () => {
      const protectedRoutes = deepLinkRedirectionRoutes.filter(
        (route) => route.canActivate && route.canActivate.length > 0,
      );
      expect(protectedRoutes.length).toBe(0);
    });

    it('should have all routes without guards', () => {
      const unprotectedRoutes = deepLinkRedirectionRoutes.filter(
        (route) => !route.canActivate || route.canActivate.length === 0,
      );
      expect(unprotectedRoutes.length).toBe(deepLinkRedirectionRoutes.length);
    });
  });

  describe('Route structure validation', () => {
    it('should have all routes with required properties', () => {
      deepLinkRedirectionRoutes.forEach((route) => {
        expect(route.path).toBeDefined();
        expect(route.loadComponent).toBeDefined();
      });
    });

    it('should not have duplicate paths', () => {
      const paths = deepLinkRedirectionRoutes.map((route) => route.path);
      const uniquePaths = [...new Set(paths)];
      expect(paths.length).toBe(uniquePaths.length);
    });

    it('should have all paths as strings', () => {
      deepLinkRedirectionRoutes.forEach((route) => {
        expect(typeof route.path).toBe('string');
      });
    });

    it('should have empty path for default route', () => {
      const route = deepLinkRedirectionRoutes[0];
      expect(route.path).toBe('');
    });

    it('should have all routes using loadComponent (not loadChildren)', () => {
      deepLinkRedirectionRoutes.forEach((route) => {
        expect(route.loadComponent).toBeDefined();
        expect((route as { loadChildren?: unknown }).loadChildren).toBeUndefined();
      });
    });
  });

  describe('Route count validation', () => {
    it('should have exactly 1 route', () => {
      expect(deepLinkRedirectionRoutes.length).toBe(1);
    });

    it('should have 1 lazy-loaded component route', () => {
      const lazyRoutes = deepLinkRedirectionRoutes.filter((route) => route.loadComponent);
      expect(lazyRoutes.length).toBe(1);
    });

    it('should not have any redirect routes', () => {
      const redirectRoutes = deepLinkRedirectionRoutes.filter((route) => (route as { redirectTo?: string }).redirectTo);
      expect(redirectRoutes.length).toBe(0);
    });

    it('should not have any module lazy loading routes', () => {
      const lazyModuleRoutes = deepLinkRedirectionRoutes.filter(
        (route) => (route as { loadChildren?: unknown }).loadChildren,
      );
      expect(lazyModuleRoutes.length).toBe(0);
    });
  });

  describe('Path naming convention', () => {
    it('should have empty string as the only path', () => {
      expect(deepLinkRedirectionRoutes.length).toBe(1);
      expect(deepLinkRedirectionRoutes[0].path).toBe('');
    });

    it('should not have any paths with uppercase letters', () => {
      deepLinkRedirectionRoutes.forEach((route) => {
        expect(route.path).toBe(route.path.toLowerCase());
      });
    });

    it('should not have any paths with spaces', () => {
      deepLinkRedirectionRoutes.forEach((route) => {
        expect(route.path).not.toContain(' ');
      });
    });

    it('should use empty string path for immediate component loading', () => {
      const route = deepLinkRedirectionRoutes.find((r) => r.path === '');
      expect(route).toBeDefined();
      expect(route?.loadComponent).toBeDefined();
    });
  });

  describe('Component lazy loading', () => {
    it('should lazy load DeepLinkRedirectionPage component correctly', async () => {
      const route = deepLinkRedirectionRoutes.find((r) => r.path === '');
      const component = await route?.loadComponent?.();
      expect(component).toBeDefined();
    });

    it('should load component from correct path', async () => {
      const route = deepLinkRedirectionRoutes[0];
      expect(route.loadComponent).toBeDefined();

      const component = await route.loadComponent();
      expect(component).toBeDefined();
    });
  });

  describe('Module purpose validation', () => {
    it('should be designed for deep link redirection handling', () => {
      // Verify that this module has a simple structure for handling deep links
      expect(deepLinkRedirectionRoutes.length).toBe(1);
      expect(deepLinkRedirectionRoutes[0].path).toBe('');
    });

    it('should not have child routes', () => {
      deepLinkRedirectionRoutes.forEach((route) => {
        const routeWithChildren = route as { children?: unknown };
        expect(routeWithChildren.children).toBeUndefined();
      });
    });

    it('should not have any guards that might prevent deep link redirection', () => {
      deepLinkRedirectionRoutes.forEach((route) => {
        expect(route.canActivate).toBeUndefined();
        const routeWithGuards = route as { canActivateChild?: unknown; canDeactivate?: unknown; canLoad?: unknown };
        expect(routeWithGuards.canActivateChild).toBeUndefined();
        expect(routeWithGuards.canDeactivate).toBeUndefined();
        expect(routeWithGuards.canLoad).toBeUndefined();
      });
    });
  });
});
