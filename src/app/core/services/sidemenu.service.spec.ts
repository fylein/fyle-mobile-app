import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { orgSettingsRes, orgSettingsParams2 } from '../mock-data/org-settings.data';
import { sidemenuAllowedActions } from '../mock-data/sidemenu-allowed-actions.data';
import { OrgSettingsService } from './org-settings.service';
import { PermissionsService } from './permissions.service';
import { ReportService } from './report.service';

import { SidemenuService } from './sidemenu.service';

describe('SidemenuService', () => {
  let sideMenuService: SidemenuService;
  let permissionsService: jasmine.SpyObj<PermissionsService>;
  let reportService: jasmine.SpyObj<ReportService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;

  beforeEach(() => {
    const permissionsServiceSpy = jasmine.createSpyObj('PermissionsService', ['allowedActions']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', ['getReportPermissions']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        SidemenuService,
        { provide: PermissionsService, useValue: permissionsServiceSpy },
        { provide: ReportService, useValue: reportServiceSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
      ],
    });
    sideMenuService = TestBed.inject(SidemenuService);
    permissionsService = TestBed.inject(PermissionsService) as jasmine.SpyObj<PermissionsService>;
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
  });

  it('should be created', () => {
    expect(sideMenuService).toBeTruthy();
  });

  it('getAllowedActions(): should return allowed actions', (done) => {
    orgSettingsService.get.and.returnValue(of(orgSettingsRes));
    reportService.getReportPermissions.and.returnValue(of(sidemenuAllowedActions.allowedReportsActions));
    permissionsService.allowedActions.and.returnValue(of(sidemenuAllowedActions.allowedAdvancesActions));

    sideMenuService.getAllowedActions().subscribe((res) => {
      expect(res).toEqual(sidemenuAllowedActions);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      expect(reportService.getReportPermissions).toHaveBeenCalledOnceWith(orgSettingsRes);
      expect(permissionsService.allowedActions).toHaveBeenCalledOnceWith(
        'advances',
        ['approve', 'create', 'delete'],
        orgSettingsRes
      );
      done();
    });
  });

  it('getAllowedActions(): should return allowed actions when advance requests are disabled', (done) => {
    orgSettingsService.get.and.returnValue(of(orgSettingsParams2));
    reportService.getReportPermissions.and.returnValue(of(sidemenuAllowedActions.allowedReportsActions));
    permissionsService.allowedActions.and.returnValue(of(sidemenuAllowedActions.allowedAdvancesActions));

    sideMenuService.getAllowedActions().subscribe((res) => {
      expect(res).toEqual(sidemenuAllowedActions);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      expect(reportService.getReportPermissions).toHaveBeenCalledOnceWith(orgSettingsParams2);
      expect(permissionsService.allowedActions).toHaveBeenCalledOnceWith(
        'advances',
        ['approve', 'create', 'delete'],
        orgSettingsParams2
      );
      done();
    });
  });
});
