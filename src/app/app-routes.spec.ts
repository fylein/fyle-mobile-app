import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { appRoutes } from './app-routes';
import { AuthGuard } from './core/guards/auth.guard';
import { VerifiedOrgAuthGuard } from './core/guards/verified-org-auth.guard';

describe('AppRoutes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AuthGuard, VerifiedOrgAuthGuard],
    });
  });

  it('should export routes array', () => {
    expect(appRoutes).toBeDefined();
    expect(Array.isArray(appRoutes)).toBeTrue();
  });

  it('should have exactly 5 routes with expected paths', () => {
    const expectedRoutes = ['', 'auth', 'post_verification', 'enterprise', 'deep_link_redirection'];
    expect(appRoutes.length).toBe(expectedRoutes.length);

    expectedRoutes.forEach((expectedPath) => {
      const route = appRoutes.find((r) => r.path === expectedPath);
      expect(route).toBeDefined();
    });
  });

  describe('Route configurations', () => {
    it('should have root route with redirect to enterprise/my_dashboard', () => {
      const route = appRoutes.find((r) => r.path === '');
      expect(route?.path).toBe('');
      expect(route?.redirectTo).toBe('enterprise/my_dashboard');
      expect(route?.pathMatch).toBe('full');
    });

    it('should have auth route with loadChildren', () => {
      const route = appRoutes.find((r) => r.path === 'auth');
      expect(route?.path).toBe('auth');
      expect(route?.loadChildren).toBeDefined();
    });

    it('should have post_verification route with loadChildren', () => {
      const route = appRoutes.find((r) => r.path === 'post_verification');
      expect(route?.path).toBe('post_verification');
      expect(route?.loadChildren).toBeDefined();
    });

    it('should have enterprise route with loadChildren', () => {
      const route = appRoutes.find((r) => r.path === 'enterprise');
      expect(route?.path).toBe('enterprise');
      expect(route?.loadChildren).toBeDefined();
    });

    it('should have deep_link_redirection route with loadChildren', () => {
      const route = appRoutes.find((r) => r.path === 'deep_link_redirection');
      expect(route?.path).toBe('deep_link_redirection');
      expect(route?.loadChildren).toBeDefined();
    });
  });

  describe('LoadChildren configurations', () => {
    it('should execute all loadChildren functions to achieve full coverage', async () => {
      const loadChildrenPromises = appRoutes
        .filter((route) => route.loadChildren)
        .map(async (route) => {
          expect(typeof route.loadChildren).toBe('function');
          const module = await route.loadChildren();
          expect(module).toBeDefined();
          return module;
        });

      const modules = await Promise.all(loadChildrenPromises);
      expect(modules.length).toBe(4);
    });
  });

  describe('Guard configurations', () => {
    it('should not have guards on auth and deep_link_redirection routes', () => {
      const unprotectedPaths = ['auth', 'deep_link_redirection'];
      unprotectedPaths.forEach((path) => {
        const route = appRoutes.find((r) => r.path === path);
        expect(route?.canActivate).toBeUndefined();
      });
    });

    it('should have only AuthGuard on post_verification route', () => {
      const route = appRoutes.find((r) => r.path === 'post_verification');
      expect(route?.canActivate).toBeDefined();
      expect(route?.canActivate?.length).toBe(1);
      expect(route?.canActivate).toContain(AuthGuard);
      expect(route?.canActivate?.[0]).toBe(AuthGuard);
    });

    it('should have AuthGuard and VerifiedOrgAuthGuard on enterprise route in correct order', () => {
      const route = appRoutes.find((r) => r.path === 'enterprise');
      expect(route?.canActivate).toBeDefined();
      expect(route?.canActivate?.length).toBe(2);
      expect(route?.canActivate).toContain(AuthGuard);
      expect(route?.canActivate).toContain(VerifiedOrgAuthGuard);
      expect(route?.canActivate?.[0]).toBe(AuthGuard);
      expect(route?.canActivate?.[1]).toBe(VerifiedOrgAuthGuard);
    });

    it('should have exactly 2 routes protected by guards', () => {
      const protectedRoutes = appRoutes.filter((route) => route.canActivate && route.canActivate.length > 0);
      expect(protectedRoutes.length).toBe(2);
    });
  });

  describe('Route structure validation', () => {
    it('should have all routes with path property as string', () => {
      appRoutes.forEach((route) => {
        expect(route.path).toBeDefined();
        expect(typeof route.path).toBe('string');
      });
    });

    it('should have exactly one redirect route on root path', () => {
      const redirectRoutes = appRoutes.filter((route) => route.redirectTo);
      expect(redirectRoutes.length).toBe(1);
      expect(redirectRoutes[0].path).toBe('');
    });

    it('should have loadChildren for all non-redirect routes', () => {
      const nonRedirectRoutes = appRoutes.filter((route) => !route.redirectTo);
      nonRedirectRoutes.forEach((route) => {
        expect(route.loadChildren).toBeDefined();
      });
    });

    it('should not have duplicate paths', () => {
      const paths = appRoutes.map((route) => route.path);
      const uniquePaths = [...new Set(paths)];
      expect(paths.length).toBe(uniquePaths.length);
    });

    it('should use snake_case for paths and not kebab-case', () => {
      const multiWordRoutes = appRoutes.filter((route) => route.path && route.path.includes('_'));
      expect(multiWordRoutes.length).toBeGreaterThan(0);

      multiWordRoutes.forEach((route) => {
        expect(route.path).toMatch(/^[a-z_]+$/);
      });

      appRoutes.forEach((route) => {
        if (route.path) {
          expect(route.path).not.toContain('-');
        }
      });
    });
  });
});
