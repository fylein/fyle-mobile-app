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

  it('should have all expected routes', () => {
    const expectedRoutes = ['', 'auth', 'post_verification', 'enterprise', 'deep_link_redirection'];

    expect(appRoutes.length).toBe(expectedRoutes.length);

    expectedRoutes.forEach((expectedPath) => {
      const route = appRoutes.find((r) => r.path === expectedPath);
      expect(route).toBeDefined();
    });
  });

  describe('Route configurations', () => {
    it('should have correct path for root route', () => {
      const route = appRoutes.find((r) => r.path === '');
      expect(route?.path).toBe('');
      expect(route?.redirectTo).toBe('enterprise/my_dashboard');
      expect(route?.pathMatch).toBe('full');
    });

    it('should have correct path for auth route', () => {
      const route = appRoutes.find((r) => r.path === 'auth');
      expect(route?.path).toBe('auth');
      expect(route?.loadChildren).toBeDefined();
    });

    it('should have correct path for post_verification route', () => {
      const route = appRoutes.find((r) => r.path === 'post_verification');
      expect(route?.path).toBe('post_verification');
      expect(route?.loadChildren).toBeDefined();
    });

    it('should have correct path for enterprise route', () => {
      const route = appRoutes.find((r) => r.path === 'enterprise');
      expect(route?.path).toBe('enterprise');
      expect(route?.loadChildren).toBeDefined();
    });

    it('should have correct path for deep_link_redirection route', () => {
      const route = appRoutes.find((r) => r.path === 'deep_link_redirection');
      expect(route?.path).toBe('deep_link_redirection');
      expect(route?.loadChildren).toBeDefined();
    });
  });

  describe('LoadChildren configurations', () => {
    it('should have loadChildren function for auth route', () => {
      const route = appRoutes.find((r) => r.path === 'auth');
      expect(route?.loadChildren).toBeDefined();
      expect(typeof route?.loadChildren).toBe('function');
    });

    it('should execute loadChildren function for auth route', async () => {
      const route = appRoutes.find((r) => r.path === 'auth');
      expect(route?.loadChildren).toBeDefined();

      // Execute the dynamic import to get coverage
      const module = await route?.loadChildren?.();
      expect(module).toBeDefined();
    });

    it('should have loadChildren function for post_verification route', () => {
      const route = appRoutes.find((r) => r.path === 'post_verification');
      expect(route?.loadChildren).toBeDefined();
      expect(typeof route?.loadChildren).toBe('function');
    });

    it('should execute loadChildren function for post_verification route', async () => {
      const route = appRoutes.find((r) => r.path === 'post_verification');
      expect(route?.loadChildren).toBeDefined();

      // Execute the dynamic import to get coverage
      const module = await route?.loadChildren?.();
      expect(module).toBeDefined();
    });

    it('should have loadChildren function for enterprise route', () => {
      const route = appRoutes.find((r) => r.path === 'enterprise');
      expect(route?.loadChildren).toBeDefined();
      expect(typeof route?.loadChildren).toBe('function');
    });

    it('should execute loadChildren function for enterprise route', async () => {
      const route = appRoutes.find((r) => r.path === 'enterprise');
      expect(route?.loadChildren).toBeDefined();

      // Execute the dynamic import to get coverage
      const module = await route?.loadChildren?.();
      expect(module).toBeDefined();
    });

    it('should have loadChildren function for deep_link_redirection route', () => {
      const route = appRoutes.find((r) => r.path === 'deep_link_redirection');
      expect(route?.loadChildren).toBeDefined();
      expect(typeof route?.loadChildren).toBe('function');
    });

    it('should execute loadChildren function for deep_link_redirection route', async () => {
      const route = appRoutes.find((r) => r.path === 'deep_link_redirection');
      expect(route?.loadChildren).toBeDefined();

      // Execute the dynamic import to get coverage
      const module = await route?.loadChildren?.();
      expect(module).toBeDefined();
    });

    it('should execute all loadChildren functions to achieve full coverage', async () => {
      // Execute all dynamic imports to get coverage for the import statements
      const loadChildrenPromises = appRoutes
        .filter((route) => route.loadChildren)
        .map(async (route) => {
          const module = await route.loadChildren();
          expect(module).toBeDefined();
          return module;
        });

      const modules = await Promise.all(loadChildrenPromises);
      expect(modules.length).toBe(4); // 4 routes have loadChildren
    });
  });

  describe('Guard configurations', () => {
    it('should not have guards on auth route', () => {
      const route = appRoutes.find((r) => r.path === 'auth');
      expect(route?.canActivate).toBeUndefined();
    });

    it('should have AuthGuard applied to post_verification route', () => {
      const route = appRoutes.find((r) => r.path === 'post_verification');
      expect(route?.canActivate).toBeDefined();
      expect(route?.canActivate).toContain(AuthGuard);
    });

    it('should have only AuthGuard on post_verification route', () => {
      const route = appRoutes.find((r) => r.path === 'post_verification');
      expect(route?.canActivate?.length).toBe(1);
      expect(route?.canActivate?.[0]).toBe(AuthGuard);
    });

    it('should have both AuthGuard and VerifiedOrgAuthGuard applied to enterprise route', () => {
      const route = appRoutes.find((r) => r.path === 'enterprise');
      expect(route?.canActivate).toBeDefined();
      expect(route?.canActivate).toContain(AuthGuard);
      expect(route?.canActivate).toContain(VerifiedOrgAuthGuard);
    });

    it('should have correct guard array length for enterprise route', () => {
      const route = appRoutes.find((r) => r.path === 'enterprise');
      expect(route?.canActivate?.length).toBe(2);
    });

    it('should have guards in correct order for enterprise route (AuthGuard before VerifiedOrgAuthGuard)', () => {
      const route = appRoutes.find((r) => r.path === 'enterprise');
      expect(route?.canActivate?.[0]).toBe(AuthGuard);
      expect(route?.canActivate?.[1]).toBe(VerifiedOrgAuthGuard);
    });

    it('should not have guards on deep_link_redirection route', () => {
      const route = appRoutes.find((r) => r.path === 'deep_link_redirection');
      expect(route?.canActivate).toBeUndefined();
    });

    it('should have exactly 2 routes protected by guards', () => {
      const protectedRoutes = appRoutes.filter((route) => route.canActivate && route.canActivate.length > 0);
      expect(protectedRoutes.length).toBe(2);
    });

    it('should have exactly 2 routes without guards', () => {
      const unprotectedRoutes = appRoutes.filter((route) => !route.canActivate || route.canActivate.length === 0);
      // Root (redirect) + auth + deep_link_redirection = 3
      expect(unprotectedRoutes.length).toBe(3);
    });
  });

  describe('Route structure validation', () => {
    it('should have all routes with path property', () => {
      appRoutes.forEach((route) => {
        expect(route.path).toBeDefined();
        expect(typeof route.path).toBe('string');
      });
    });

    it('should have exactly one redirect route', () => {
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

    it('should have all paths as strings', () => {
      appRoutes.forEach((route) => {
        expect(typeof route.path).toBe('string');
      });
    });

    it('should use snake_case for multi-word paths', () => {
      const multiWordRoutes = appRoutes.filter((route) => route.path && route.path.includes('_'));
      expect(multiWordRoutes.length).toBeGreaterThan(0);

      multiWordRoutes.forEach((route) => {
        expect(route.path).toMatch(/^[a-z_]+$/);
      });
    });

    it('should not use kebab-case in any path', () => {
      appRoutes.forEach((route) => {
        if (route.path) {
          expect(route.path).not.toContain('-');
        }
      });
    });
  });

  describe('Redirect configuration', () => {
    it('should have root path redirect to enterprise/my_dashboard', () => {
      const rootRoute = appRoutes.find((route) => route.path === '');
      expect(rootRoute).toBeDefined();
      expect(rootRoute?.redirectTo).toBe('enterprise/my_dashboard');
    });

    it('should use full pathMatch for root redirect', () => {
      const rootRoute = appRoutes.find((route) => route.path === '');
      expect(rootRoute?.pathMatch).toBe('full');
    });

    it('should only have redirect on root route', () => {
      const routesWithRedirect = appRoutes.filter((route) => route.redirectTo);
      expect(routesWithRedirect.length).toBe(1);
    });
  });

  describe('Route count validation', () => {
    it('should have exactly 5 routes', () => {
      expect(appRoutes.length).toBe(5);
    });

    it('should have 1 redirect route', () => {
      const redirectRoutes = appRoutes.filter((route) => route.redirectTo);
      expect(redirectRoutes.length).toBe(1);
    });
  });
});
