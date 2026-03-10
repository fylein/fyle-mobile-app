import { TestBed } from '@angular/core/testing';
import { DelegationService } from './delegation.service';
import { OrgUserService } from './org-user.service';

describe('DelegationService', () => {
  let service: DelegationService;
  let orgUserService: jasmine.SpyObj<OrgUserService>;

  beforeEach(() => {
    orgUserService = jasmine.createSpyObj('OrgUserService', ['isSwitchedToDelegator', 'getBaseDelegateeUserId']);

    TestBed.configureTestingModule({
      providers: [
        DelegationService,
        {
          provide: OrgUserService,
          useValue: orgUserService,
        },
      ],
    });

    service = TestBed.inject(DelegationService);
  });

  it('inDelegateeMode(): should proxy OrgUserService.isSwitchedToDelegator()', async () => {
    orgUserService.isSwitchedToDelegator.and.resolveTo(true);

    const res = await service.inDelegateeMode();

    expect(res).toBeTrue();
    expect(orgUserService.isSwitchedToDelegator).toHaveBeenCalledTimes(1);
  });

  it('getDelegateeUserId(): should proxy OrgUserService.getBaseDelegateeUserId()', async () => {
    orgUserService.getBaseDelegateeUserId.and.resolveTo('us123');

    const res = await service.getDelegateeUserId();

    expect(res).toEqual('us123');
    expect(orgUserService.getBaseDelegateeUserId).toHaveBeenCalledTimes(1);
  });

  it('isDelegateeOwnedReport(): should return false when not in delegatee mode (and not read delegatee id)', async () => {
    orgUserService.isSwitchedToDelegator.and.resolveTo(false);

    const res = await service.isDelegateeOwnedReport('us123');

    expect(res).toBeFalse();
    expect(orgUserService.isSwitchedToDelegator).toHaveBeenCalledTimes(1);
    expect(orgUserService.getBaseDelegateeUserId).not.toHaveBeenCalled();
  });

  it('isDelegateeOwnedReport(): should return false when delegatee id is missing', async () => {
    orgUserService.isSwitchedToDelegator.and.resolveTo(true);
    orgUserService.getBaseDelegateeUserId.and.resolveTo(null);

    const res = await service.isDelegateeOwnedReport('us123');

    expect(res).toBeFalse();
    expect(orgUserService.isSwitchedToDelegator).toHaveBeenCalledTimes(1);
    expect(orgUserService.getBaseDelegateeUserId).toHaveBeenCalledTimes(1);
  });

  it('isDelegateeOwnedReport(): should return true when report owner matches delegatee user id', async () => {
    orgUserService.isSwitchedToDelegator.and.resolveTo(true);
    orgUserService.getBaseDelegateeUserId.and.resolveTo('us123');

    const res = await service.isDelegateeOwnedReport('us123');

    expect(res).toBeTrue();
  });

  it('isDelegateeOwnedReport(): should return false when report owner does not match delegatee user id', async () => {
    orgUserService.isSwitchedToDelegator.and.resolveTo(true);
    orgUserService.getBaseDelegateeUserId.and.resolveTo('us999');

    const res = await service.isDelegateeOwnedReport('us123');

    expect(res).toBeFalse();
  });

  it('isDelegateeOwnedExpense(): should behave the same as report ownership checks', async () => {
    orgUserService.isSwitchedToDelegator.and.resolveTo(true);
    orgUserService.getBaseDelegateeUserId.and.resolveTo('us_expense_owner');

    const matches = await service.isDelegateeOwnedExpense('us_expense_owner');
    const mismatches = await service.isDelegateeOwnedExpense('us_other');

    expect(matches).toBeTrue();
    expect(mismatches).toBeFalse();
  });
});
