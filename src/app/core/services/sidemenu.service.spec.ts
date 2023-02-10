import { TestBed } from '@angular/core/testing';
import { PermissionsService } from './permissions.service';
import { SidemenuService } from './sidemenu.service';
import { OrgSettingsService } from './org-settings.service';
import { ReportService } from './report.service';
import { of } from 'rxjs';
import { orgSettingsParams } from '../mock-data/org-settings.data';
import {
  reportAllowedActionsResponse,
  advanceAllowedActionsResponse,
} from '../mock-data/sidemenubar-allowed-actions.data';

describe('SidemenuService', () => {
  let sidemenuService: SidemenuService;
  let reportService: jasmine.SpyObj<ReportService>;
  let permissionsService: jasmine.SpyObj<PermissionsService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;

  const permissionsServiceSpy = jasmine.createSpyObj('PermissionService', ['allowedActions']);
  const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
  const reportServiceSpy = jasmine.createSpyObj('ReportService', ['getReportPermissions']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SidemenuService,
        {
          provide: PermissionsService,
          useValue: permissionsServiceSpy,
        },
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: ReportService,
          useValue: reportServiceSpy,
        },
      ],
    });

    sidemenuService = TestBed.inject(SidemenuService);
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    permissionsService = TestBed.inject(PermissionsService) as jasmine.SpyObj<PermissionsService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
  });

  describe('getAllowedActions() :', () => {
    it('should be created', () => {
      expect(sidemenuService).toBeTruthy();
    });

    it('should call get() and return the expected result', () => {
      const allowedReportsActions = of(reportAllowedActionsResponse);
      const allowedAdvancesActions = of(advanceAllowedActionsResponse);
      orgSettingsService.get.and.returnValue(of(orgSettingsParams));
      reportService.getReportPermissions.and.returnValue(allowedReportsActions);
      permissionsService.allowedActions.and.returnValue(allowedAdvancesActions);

      sidemenuService.getAllowedActions().subscribe((result) => {
        expect(orgSettingsService.get).toHaveBeenCalled();
        expect(reportService.getReportPermissions).toHaveBeenCalledWith(orgSettingsParams);
        expect(permissionsService.allowedActions).toHaveBeenCalledWith(
          'advances',
          ['approve', 'create', 'delete'],
          orgSettingsParams
        );
        expect(result).toEqual({
          allowedReportsActions: reportAllowedActionsResponse,
          allowedAdvancesActions: advanceAllowedActionsResponse,
        });
      });
    });

    it('should return the result of forkJoin when get method of OrgSettingsService returns value', () => {
      orgSettingsService.get.and.returnValue(of(orgSettingsParams));

      const allowedReportsActions = of(reportAllowedActionsResponse);
      const allowedAdvancesActions = of(advanceAllowedActionsResponse);
      reportService.getReportPermissions.and.returnValue(of(allowedReportsActions));

      permissionsService.allowedActions.and.returnValue(of(allowedAdvancesActions));

      sidemenuService.getAllowedActions().subscribe((result) => {
        expect(result).toEqual({ allowedReportsActions, allowedAdvancesActions });
      });
    });

    it('should return the expected result when advances and advance_requests are not enabled', () => {
      const orgSettings = {
        advance_requests: { enabled: false, allowed: false },
        advances: { enabled: false, allowed: false },
      };

      const allowedReportsActions = of(reportAllowedActionsResponse);

      orgSettingsService.get.and.returnValue(of(orgSettings));
      reportService.getReportPermissions.and.returnValue(of(allowedReportsActions));

      sidemenuService.getAllowedActions().subscribe((result) => {
        expect(orgSettingsService.get).toHaveBeenCalled();
        expect(reportService.getReportPermissions).toHaveBeenCalledWith(orgSettings);
        expect(result).toEqual({
          allowedReportsActions,
          allowedAdvancesActions: null,
        });
      });
    });

    it('should call allowedActions from permissionsService if both the params are true, and return null if false', () => {
      const orgSettings = {
        advance_requests: { enabled: true, allowed: true },
        advances: { enabled: false, allowed: false },
      };
      const allowedReportsActions = {};
      const allowedAdvancesActions = {};

      orgSettingsService.get.and.returnValue(of(orgSettings));
      reportService.getReportPermissions.and.returnValue(of(allowedReportsActions));
      permissionsService.allowedActions.and.returnValue(of(allowedAdvancesActions));

      sidemenuService.getAllowedActions().subscribe((result) => {
        expect(orgSettingsService.get).toHaveBeenCalled();
        expect(reportService.getReportPermissions).toHaveBeenCalledWith(orgSettings);
        expect(result).toEqual({ allowedReportsActions, allowedAdvancesActions });
        expect(permissionsService.allowedActions).toHaveBeenCalledWith(
          'advances',
          ['approve', 'create', 'delete'],
          orgSettings
        );
      });

      const orgSettings2 = {
        advance_requests: { enabled: false, allowed: false },
        advances: { enabled: false, allowed: false },
      };

      orgSettingsService.get.and.returnValue(of(orgSettings2));

      sidemenuService.getAllowedActions().subscribe((result) => {
        expect(orgSettingsService.get).toHaveBeenCalled();
        expect(reportService.getReportPermissions).toHaveBeenCalledWith(orgSettings2);
        expect(result).toEqual({ allowedReportsActions, allowedAdvancesActions: null });
        expect(permissionsService.allowedActions).toHaveBeenCalled();
      });
    });
  });
});
