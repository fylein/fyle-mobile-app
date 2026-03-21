import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { DelegationService } from '../services/delegation.service';
import { DelegationRouteAccess } from '../models/delegation-route-access.model';
import { DelegationRouteScope } from '../models/delegation-route-scope.model';

/**
 * Route-level delegation access.
 *
 * Semantics (enforced only in delegatee mode):
 * - Delegates with `ALL` scope always have access.
 * - If `allowedDelegationScopes` includes a scope, that scope (and combinations thereof) can access.
 * - If `allowedDelegationScopes` is missing/empty => the route is **ALL-only** (SUBMIT/APPROVE delegates can't access).
 *
 * Example (delegatee mode):
 *
 * // Route config:
 * data: { allowedDelegationScopes: ['SUBMIT'] }
 *
 * // If delegate's actual scope (from /auth/access_token) is,
 * // - ['SUBMIT']            -> then allowed
 * // - ['SUBMIT','APPROVE']  -> allowed
 * // - ['ALL']               -> allowed (ALL bypasses all checks)
 * // - ['APPROVE']           -> NOT allowed (no SUBMIT)
 */

@Injectable({
  providedIn: 'root',
})
export class DelegationScopeGuard {
  private delegationService = inject(DelegationService);

  private router = inject(Router);

  async canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    const allowedDelegationScopes = (next.data?.['allowedDelegationScopes'] ?? []) as DelegationRouteAccess;

    // Only enforce when in delegatee mode.
    const inDelegateeMode = await this.delegationService.inDelegateeMode();
    if (!inDelegateeMode) {
      return true;
    }

    const scopes = await this.delegationService.getScopes();
    // If scopes aren't available yet, allow navigation to avoid redirect loops.
    if (!scopes) {
      return true;
    }

    if (scopes.includes('ALL')) {
      return true;
    }

    // Default is ALL-only when allowedDelegationScopes isn't provided.
    // ALL-only is not allowed for SUBMIT/APPROVE delegates but for ALL scope.
    if (allowedDelegationScopes.length === 0) {
      // Defensive: avoid a redirect loop if dashboard was misconfigured.
      if (state.url?.includes('/enterprise/my_dashboard')) {
        return true;
      }
      return this.router.parseUrl('/enterprise/my_dashboard');
    }

    if (!scopes.some((s) => allowedDelegationScopes.includes(s as DelegationRouteScope))) {
      return this.router.parseUrl('/enterprise/my_dashboard');
    }

    return true;
  }
}
