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

  it('should have exactly 1 route with invited_user path', () => {
    expect(postVerificationRoutes.length).toBe(1);
    const route = postVerificationRoutes.find((r) => r.path === 'invited_user');
    expect(route).toBeDefined();
  });

  describe('Route configurations', () => {
    it('should have correct path and loadComponent for invited_user route', () => {
      const route = postVerificationRoutes.find((r) => r.path === 'invited_user');
      expect(route?.path).toBe('invited_user');
      expect(route?.loadComponent).toBeDefined();
      expect(typeof route?.loadComponent).toBe('function');
    });
  });

  describe('LoadComponent configurations', () => {
    it('should execute loadComponent function for invited_user route', async () => {
      const route = postVerificationRoutes.find((r) => r.path === 'invited_user');
      expect(route?.loadComponent).toBeDefined();

      const component = await route?.loadComponent?.();
      expect(component).toBeDefined();
    });
  });

  describe('Guard configurations', () => {
    it('should have no routes with guards', () => {
      postVerificationRoutes.forEach((route) => {
        expect(route?.canActivate).toBeUndefined();
      });
      const protectedRoutes = postVerificationRoutes.filter(
        (route) => route.canActivate && route.canActivate.length > 0,
      );
      expect(protectedRoutes.length).toBe(0);
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

    it('should use snake_case for paths and not kebab-case', () => {
      postVerificationRoutes.forEach((route) => {
        expect(route.path).toMatch(/^[a-z_]+$/);
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
    it('should have all paths in lowercase without spaces', () => {
      postVerificationRoutes.forEach((route) => {
        expect(route.path).toBe(route.path.toLowerCase());
        expect(route.path).not.toContain(' ');
      });
    });
  });
});
