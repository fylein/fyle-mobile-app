import { TestBed } from '@angular/core/testing';
import { PermissionsService } from './permissions.service';
import { SidemenuService } from './sidemenu.service';
import { OrgSettingsService } from './org-settings.service';
import { ReportService } from './report.service';
import { of } from 'rxjs';
import { orgSettingsParams } from '../mock-data/org-settings.data';
import { reportAllowedActionsResponse } from '../mock-data/allowed-actions.data';

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

  it('should be created', () => {
    expect(sidemenuService).toBeTruthy();
  });

  it('getAllowedActions() :should call orgSettingsService.get and return the expected result', () => {
    //mock data which is to be received from mock-data folder
    const allowedReportsActions = of({ reportPermissions: true });
    const allowedAdvancesActions = of({ advancePermissions: true });
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
        allowedReportsActions: { reportPermissions: true },
        allowedAdvancesActions: { advancePermissions: true },
      });
    });
  });

  it('getAllActiond():should return the result of forkJoin when get method of OrgSettingsService returns value', () => {
    const orgSettings = { advance_requests: { enabled: true }, advances: { enabled: true } };
    orgSettingsService.get.and.returnValue(of(orgSettings));

    const allowedReportsActions = of({ reportPermissions: true });
    const allowedAdvancesActions = of({ advancePermissions: true });
    reportService.getReportPermissions.and.returnValue(of(allowedReportsActions));

    permissionsService.allowedActions.and.returnValue(of(allowedAdvancesActions));

    sidemenuService.getAllowedActions().subscribe((result) => {
      expect(result).toEqual({ allowedReportsActions, allowedAdvancesActions });
    });
  });

  it('should call orgSettingsService.get and return the expected result when advances and advance_requests are not enabled', () => {
    const orgSettings = {
      advance_requests: { enabled: false },
      advances: { enabled: false },
    };

    const allowedReportsActions = of({ reportPermissions: true });

    orgSettingsService.get.and.returnValue(of(orgSettings));
    reportService.getReportPermissions.and.returnValue(of(allowedReportsActions));

    sidemenuService.getAllowedActions().subscribe((result) => {
      expect(result).toEqual({
        allowedReportsActions,
        allowedAdvancesActions: null,
      });
    });
  });

  it('should call allowedActions from permissionsService if advance_requests.enabled or advances.enabled is true, and return null if advance_requests.enabled or advances.enabled is false', () => {
    const orgSettings = { advance_requests: { enabled: true }, advances: { enabled: false } };
    const allowedReportsActions = {};
    const allowedAdvancesActions = {};

    orgSettingsService.get.and.returnValue(of(orgSettings));
    reportService.getReportPermissions.and.returnValue(of(allowedReportsActions));
    permissionsService.allowedActions.and.returnValue(of(allowedAdvancesActions));

    sidemenuService.getAllowedActions().subscribe((result) => {
      expect(result).toEqual({ allowedReportsActions, allowedAdvancesActions });
      expect(permissionsService.allowedActions).toHaveBeenCalledWith(
        'advances',
        ['approve', 'create', 'delete'],
        orgSettings
      );
    });

    const orgSettings2 = { advance_requests: { enabled: false }, advances: { enabled: false } };

    orgSettingsService.get.and.returnValue(of(orgSettings2));

    sidemenuService.getAllowedActions().subscribe((result) => {
      expect(result).toEqual({ allowedReportsActions, allowedAdvancesActions: null });
      //expect(permissionsService.allowedActions).not.toHaveBeenCalled();
    });
  });
});
