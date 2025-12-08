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

  it('should have exactly 1 route with empty path', () => {
    expect(deepLinkRedirectionRoutes.length).toBe(1);
    expect(deepLinkRedirectionRoutes[0].path).toBe('');
  });

  describe('Route configurations', () => {
    it('should have correct path and loadComponent for root route', () => {
      const route = deepLinkRedirectionRoutes.find((r) => r.path === '');
      expect(route?.path).toBe('');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });
  });

  describe('LoadComponent configurations', () => {
    it('should execute loadComponent function for root route', async () => {
      const route = deepLinkRedirectionRoutes.find((r) => r.path === '');
      expect(route?.loadComponent).toBeDefined();

      const component = await route?.loadComponent?.();
      expect(component).toBeDefined();
    });
  });

  describe('Guard configurations', () => {
    it('should have no routes with guards', () => {
      deepLinkRedirectionRoutes.forEach((route) => {
        expect(route?.canActivate).toBeUndefined();
      });
      const protectedRoutes = deepLinkRedirectionRoutes.filter(
        (route) => route.canActivate && route.canActivate.length > 0,
      );
      expect(protectedRoutes.length).toBe(0);
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

    it('should have all routes using loadComponent (not loadChildren)', () => {
      deepLinkRedirectionRoutes.forEach((route) => {
        expect(route.loadComponent).toBeDefined();
        expect((route as { loadChildren?: unknown }).loadChildren).toBeUndefined();
      });
    });
  });

  describe('Route count validation', () => {
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

  describe('Module purpose validation', () => {
    it('should be designed for deep link redirection handling without blocking guards', () => {
      expect(deepLinkRedirectionRoutes.length).toBe(1);
      expect(deepLinkRedirectionRoutes[0].path).toBe('');

      deepLinkRedirectionRoutes.forEach((route) => {
        const routeWithChildren = route as { children?: unknown };
        expect(routeWithChildren.children).toBeUndefined();

        expect(route.canActivate).toBeUndefined();
        const routeWithGuards = route as { canActivateChild?: unknown; canDeactivate?: unknown; canLoad?: unknown };
        expect(routeWithGuards.canActivateChild).toBeUndefined();
        expect(routeWithGuards.canDeactivate).toBeUndefined();
        expect(routeWithGuards.canLoad).toBeUndefined();
      });
    });
  });
});
