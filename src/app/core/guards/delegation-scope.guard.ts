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
 * - If `delegationAccess` includes a scope, that scope (and combinations thereof) can access.
 * - If `delegationAccess` is missing/empty => the route is **ALL-only** (SUBMIT/APPROVE delegates can't access).
 *
 * Examples:
 * - `['SUBMIT']`: SUBMIT + (SUBMIT+APPROVE) + ALL can access; APPROVE-only cannot.
 * - `['APPROVE']`: APPROVE + (SUBMIT+APPROVE) + ALL can access; SUBMIT-only cannot.
 * - `['SUBMIT','APPROVE']`: SUBMIT-only / APPROVE-only / both / ALL can access.
 * - `[]` or omitted: only ALL can access.
 */

@Injectable({
  providedIn: 'root',
})
export class DelegationScopeGuard {
  private delegationService = inject(DelegationService);

  private router = inject(Router);

  async canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    const allowed = (next.data?.['delegationAccess'] ?? []) as DelegationRouteAccess;

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

    // Default is ALL-only when delegationAccess isn't provided.
    // ALL-only is not allowed for SUBMIT/APPROVE delegates but for ALL scope.
    if (allowed.length === 0) {
      // Defensive: avoid a redirect loop if dashboard was misconfigured.
      if (state.url?.includes('/enterprise/my_dashboard')) {
        return true;
      }
      return this.router.parseUrl('/enterprise/my_dashboard');
    }

    if (!scopes.some((s) => allowed.includes(s as DelegationRouteScope))) {
      return this.router.parseUrl('/enterprise/my_dashboard');
    }

    return true;
  }
}
