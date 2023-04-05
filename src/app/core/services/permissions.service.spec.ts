import { TestBed } from '@angular/core/testing';
import { PermissionsService } from './permissions.service';
import { AuthService } from './auth.service';
import { of } from 'rxjs';
import { orgSettingsRes } from '../mock-data/org-settings.data';
import { reportAllowedActionsResponse } from '../mock-data/allowed-actions.data';

describe('PermissionsService', () => {
  let permissionsService: PermissionsService;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getRoles']);
    TestBed.configureTestingModule({
      providers: [
        PermissionsService,
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
      ],
    });
    permissionsService = TestBed.inject(PermissionsService);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(permissionsService).toBeTruthy();
  });

  describe('allowedActions():', () => {
    it('should get allowed actions for a user', (done) => {
      const roles = ['HOP', 'HOD', 'OWNER'];
      const actions = ['approve', 'create', 'delete'];
      const resource = 'reports';

      authService.getRoles.and.returnValue(of(roles));
      spyOn(permissionsService, 'allowedAccess').and.returnValue(true);

      const setAllowedActionsSpy = spyOn(permissionsService, 'setAllowedActions');
      setAllowedActionsSpy
        .withArgs(actions, { allowedRouteAccess: true, approve: true, create: true, delete: true }, 'admin', resource)
        .and.callThrough();
      setAllowedActionsSpy.withArgs(actions, { allowedRouteAccess: false }, 'hop', resource).and.callThrough();
      setAllowedActionsSpy
        .withArgs(actions, { allowedRouteAccess: true, approve: true, create: false, delete: false }, 'hod', resource)
        .and.callThrough();
      setAllowedActionsSpy
        .withArgs(actions, { allowedRouteAccess: true, approve: true, create: false, delete: false }, 'owner', resource)
        .and.callThrough();

      permissionsService.allowedActions(resource, actions, orgSettingsRes).subscribe((res) => {
        expect(res).toEqual({ allowedRouteAccess: true, approve: true, create: false, delete: false });
        expect(permissionsService.setAllowedActions).toHaveBeenCalledWith(
          actions,
          { allowedRouteAccess: true, approve: true, create: false, delete: false },
          'hop',
          resource
        );
        expect(permissionsService.setAllowedActions).toHaveBeenCalledWith(
          actions,
          { allowedRouteAccess: true, approve: true, create: false, delete: false },
          'hod',
          resource
        );
        expect(permissionsService.setAllowedActions).toHaveBeenCalledWith(
          actions,
          { allowedRouteAccess: true, approve: true, create: false, delete: false },
          'owner',
          resource
        );
        expect(permissionsService.setAllowedActions).toHaveBeenCalledTimes(3);
        expect(authService.getRoles).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return actions using SUPERADMIN', (done) => {
      const roles = ['SUPER_ADMIN'];
      const actions = ['approve', 'create', 'delete'];
      const resource = 'reports';

      authService.getRoles.and.returnValue(of(roles));
      spyOn(permissionsService, 'allowedAccess').and.returnValue(true);

      permissionsService.allowedActions(resource, actions, orgSettingsRes).subscribe((res) => {
        expect(res).toBeNull();
        expect(authService.getRoles).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should throw error', (done) => {
      const roles = ['HOP', 'HOD', 'OWNER'];
      const actions = ['approve', 'create', 'delete'];
      const resource = 'reports';

      authService.getRoles.and.returnValue(of(roles));
      spyOn(permissionsService, 'allowedAccess').and.returnValue(true);
      spyOn(permissionsService, 'setAllowedActions').and.returnValues(null, null);

      permissionsService.allowedActions(resource, actions, orgSettingsRes).subscribe({
        next: (res) => {
          expect(res).toBeNull();
          expect(authService.getRoles).toHaveBeenCalledTimes(1);
        },
        error: (err) => expect(err).toEqual('no route access'),
      });
      done();
    });
  });

  it('setAllowedActions(): set allowed actions', () => {
    const actions = ['approve', 'create', 'delete'];

    const allowedActions = reportAllowedActionsResponse;
    const role = 'admin';
    const resource = 'reports';

    permissionsService.setAllowedActions(actions, allowedActions, role, resource);

    expect(allowedActions.allowedRouteAccess).toBeTruthy();
  });

  describe('allowedAccess():', () => {
    it('should return resource actions', () => {
      expect(permissionsService.allowedAccess('advances', orgSettingsRes)).toBeTrue();
    });

    it('should return resource actions when advance_requests in not present', () => {
      expect(
        permissionsService.allowedAccess('advances', {
          ...orgSettingsRes,
          advance_requests: {
            allowed: false,
            enabled: false,
          },
        })
      ).toBeTrue();
    });
  });
});
