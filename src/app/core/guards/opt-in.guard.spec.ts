import { TestBed } from '@angular/core/testing';

import { OptInGuard } from './opt-in.guard';
import { UtilityService } from '../services/utility.service';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';

describe('OptInGuard', () => {
  let guard: OptInGuard;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const utilityServiceSpy = jasmine.createSpyObj('UtilityService', [
      'canShowOptInAfterExpenseCreation',
      'canShowOptInModal',
      'canShowOptInAfterAddingCard',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: UtilityService,
          useValue: utilityServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
      ],
    });
    guard = TestBed.inject(OptInGuard);
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate():', () => {
    it('should return true if the current route includes "my_expenses" and the next route does not include "add_edit" and canShowOptIn is false', (done) => {
      const currentRoute = 'my_expenses';
      const nextRoute = 'my_dashboard';
      const canShowOptIn = false;
      const canShowOptInModal = true;
      Object.defineProperty(router, 'routerState', { writable: true, value: { snapshot: { url: currentRoute } } });
      utilityService.canShowOptInAfterExpenseCreation.and.returnValue(canShowOptIn);
      utilityService.canShowOptInModal.and.returnValue(of(canShowOptInModal));

      const canActivate = guard.canActivate(new ActivatedRoute().snapshot, {
        url: nextRoute,
      } as RouterStateSnapshot) as Observable<boolean>;
      canActivate.subscribe((res) => {
        expect(utilityService.canShowOptInAfterExpenseCreation).toHaveBeenCalledTimes(1);
        expect(utilityService.canShowOptInModal).not.toHaveBeenCalled();
        expect(res).toBeTrue();
        done();
      });
    });

    it('should return true if the current route includes "my_expenses" and the next route does not include "add_edit" and canShowOptIn is true', (done) => {
      const currentRoute = 'my_expenses';
      const nextRoute = 'my_dashboard';
      const canShowOptIn = true;
      const canShowOptInModal = true;
      Object.defineProperty(router, 'routerState', { writable: true, value: { snapshot: { url: currentRoute } } });
      utilityService.canShowOptInAfterExpenseCreation.and.returnValue(canShowOptIn);
      utilityService.canShowOptInModal.and.returnValue(of(canShowOptInModal));

      const canActivate = guard.canActivate(new ActivatedRoute().snapshot, {
        url: nextRoute,
      } as RouterStateSnapshot) as Observable<boolean>;
      canActivate.subscribe((res) => {
        expect(utilityService.canShowOptInAfterExpenseCreation).toHaveBeenCalledTimes(1);
        expect(utilityService.canShowOptInModal).toHaveBeenCalledOnceWith({
          feature: 'OPT_IN_POPUP_POST_EXPENSE_CREATION',
          key: 'OPT_IN_POPUP_SHOWN_COUNT',
        });
        expect(res).toBeFalse();
        done();
      });
    });

    it('should return true if the current route includes "my_dashboard" and canShowOptIn is false', (done) => {
      const currentRoute = 'my_dashboard';
      const nextRoute = 'my_dashboard';
      const canShowOptIn = false;
      const canShowOptInModal = true;
      Object.defineProperty(router, 'routerState', { writable: true, value: { snapshot: { url: currentRoute } } });
      utilityService.canShowOptInAfterAddingCard.and.returnValue(canShowOptIn);
      utilityService.canShowOptInModal.and.returnValue(of(canShowOptInModal));

      const canActivate = guard.canActivate(new ActivatedRoute().snapshot, {
        url: nextRoute,
      } as RouterStateSnapshot) as Observable<boolean>;
      canActivate.subscribe((res) => {
        expect(utilityService.canShowOptInAfterAddingCard).toHaveBeenCalledTimes(1);
        expect(utilityService.canShowOptInModal).not.toHaveBeenCalled();
        expect(res).toBeTrue();
        done();
      });
    });

    it('should return true if the current route includes "my_dashboard" and canShowOptIn is true', (done) => {
      const currentRoute = 'my_dashboard';
      const nextRoute = 'my_dashboard';
      const canShowOptIn = true;
      const canShowOptInModal = true;
      Object.defineProperty(router, 'routerState', { writable: true, value: { snapshot: { url: currentRoute } } });
      utilityService.canShowOptInAfterAddingCard.and.returnValue(canShowOptIn);
      utilityService.canShowOptInModal.and.returnValue(of(canShowOptInModal));

      const canActivate = guard.canActivate(new ActivatedRoute().snapshot, {
        url: nextRoute,
      } as RouterStateSnapshot) as Observable<boolean>;
      canActivate.subscribe((res) => {
        expect(utilityService.canShowOptInAfterAddingCard).toHaveBeenCalledTimes(1);
        expect(utilityService.canShowOptInModal).toHaveBeenCalledOnceWith({
          feature: 'OPT_IN_POPUP_POST_CARD_ADDITION',
          key: 'OPT_IN_POPUP_SHOWN_COUNT',
        });
        expect(res).toBeFalse();
        done();
      });
    });

    it('should return true if the current route includes "manage_corporate_cards" and canShowOptIn is false', (done) => {
      const currentRoute = 'manage_corporate_cards';
      const nextRoute = 'manage_corporate_cards';
      const canShowOptIn = false;
      const canShowOptInModal = true;
      Object.defineProperty(router, 'routerState', { writable: true, value: { snapshot: { url: currentRoute } } });
      utilityService.canShowOptInAfterAddingCard.and.returnValue(canShowOptIn);
      utilityService.canShowOptInModal.and.returnValue(of(canShowOptInModal));

      const canActivate = guard.canActivate(new ActivatedRoute().snapshot, {
        url: nextRoute,
      } as RouterStateSnapshot) as Observable<boolean>;
      canActivate.subscribe((res) => {
        expect(utilityService.canShowOptInAfterAddingCard).toHaveBeenCalledTimes(1);
        expect(utilityService.canShowOptInModal).not.toHaveBeenCalled();
        expect(res).toBeTrue();
        done();
      });
    });

    it('should return true if the current route includes "manage_corporate_cards" and canShowOptIn is true', (done) => {
      const currentRoute = 'manage_corporate_cards';
      const nextRoute = 'manage_corporate_cards';
      const canShowOptIn = true;
      const canShowOptInModal = true;
      Object.defineProperty(router, 'routerState', { writable: true, value: { snapshot: { url: currentRoute } } });
      utilityService.canShowOptInAfterAddingCard.and.returnValue(canShowOptIn);
      utilityService.canShowOptInModal.and.returnValue(of(canShowOptInModal));

      const canActivate = guard.canActivate(new ActivatedRoute().snapshot, {
        url: nextRoute,
      } as RouterStateSnapshot) as Observable<boolean>;
      canActivate.subscribe((res) => {
        expect(utilityService.canShowOptInAfterAddingCard).toHaveBeenCalledTimes(1);
        expect(utilityService.canShowOptInModal).toHaveBeenCalledOnceWith({
          feature: 'OPT_IN_POPUP_POST_CARD_ADDITION',
          key: 'OPT_IN_POPUP_SHOWN_COUNT',
        });
        expect(res).toBeFalse();
        done();
      });
    });

    it('should return true if the current route does not match any specific conditions', (done) => {
      const currentRoute = 'some_other_route';
      const nextRoute = 'another_route';
      Object.defineProperty(router, 'routerState', { writable: true, value: { snapshot: { url: currentRoute } } });

      const canActivate = guard.canActivate(new ActivatedRoute().snapshot, {
        url: nextRoute,
      } as RouterStateSnapshot);

      // Since it returns boolean directly (not Observable), we can assert directly
      expect(canActivate).toBeTrue();
      expect(utilityService.canShowOptInAfterExpenseCreation).not.toHaveBeenCalled();
      expect(utilityService.canShowOptInAfterAddingCard).not.toHaveBeenCalled();
      expect(utilityService.canShowOptInModal).not.toHaveBeenCalled();
      done();
    });
  });
});
