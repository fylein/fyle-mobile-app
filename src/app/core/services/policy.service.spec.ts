import { TestBed } from '@angular/core/testing';
import { SpenderPlatformV1BetaApiService } from './spender-platform-v1-beta-api.service';
import { PolicyService } from './policy.service';
import { ApproverPlatformApiService } from './approver-platform-api.service';
import { publicPolicyExpenseData } from '../mock-data/policy-service.data';
import { platformPolicyServiceData } from '../mock-data/platform-policy-service.data';

describe('PolicyService', () => {
  let policyService: PolicyService;
  let spenderPlatformV1BetaApiService: jasmine.SpyObj<SpenderPlatformV1BetaApiService>;
  let approverPlatformApiService: jasmine.SpyObj<ApproverPlatformApiService>;

  beforeEach(() => {
    const spenderPlatformV1BetaApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1BetaApiService', ['get']);
    const approverPlatformApiServiceSpy = jasmine.createSpyObj('ApproverPlatformApiService', ['get']);
    TestBed.configureTestingModule({
      providers: [
        PolicyService,
        {
          provide: SpenderPlatformV1BetaApiService,
          useValue: spenderPlatformV1BetaApiServiceSpy,
        },
        {
          provide: ApproverPlatformApiService,
          useValue: spenderPlatformV1BetaApiServiceSpy,
        },
      ],
    });
    policyService = TestBed.inject(PolicyService);
    spenderPlatformV1BetaApiService = TestBed.inject(
      SpenderPlatformV1BetaApiService
    ) as jasmine.SpyObj<SpenderPlatformV1BetaApiService>;
    approverPlatformApiService = TestBed.inject(
      ApproverPlatformApiService
    ) as jasmine.SpyObj<ApproverPlatformApiService>;
  });

  it(' should be created', () => {
    expect(policyService).toBeTruthy();
  });

  it('transformTo() : should map a PublicPolicyExpense to a PlatformPolicyExpense', () => {
    const result = policyService.transformTo(publicPolicyExpenseData);
    expect(result).toEqual(platformPolicyServiceData);
  });

  it('getApprovalString(): should return string with emails in bold when given array of emails', () => {
    const emails = ['john.doe@fyle.in', 'jane.doe@fyle.in'];
    const expected = 'Expense will need additional approval from <b>john.doe@fyle.in</b>, <b>jane.doe@fyle.in</b>';

    expect(policyService.getApprovalString(emails)).toEqual(expected);
  });

  it('isPrimaryApproverSkipped(): should return true if the description matches', () => {
    const description = 'Primary approver will be skipped for this expense.';
    const result = policyService.isPrimaryApproverSkipped(description);
    expect(result).toBe(true);
  });

  it('needAdditionalApproval(): should return true if the description matches', () => {
    const description = 'This expense will need approval from the finance team.';
    const result = policyService.needAdditionalApproval(description);
    expect(result).toBe(true);
  });

  it('isExpenseCapped(): should return true for a description matches', () => {
    const description = 'This expense will be capped to $1000';
    const result = policyService.isExpenseCapped(description);
    expect(result).toBe(true);
  });

  it('isExpenseFlagged(): should return true for a description that includes expense flag', () => {
    const description =
      ' The expense will be flagged and employee will be alerted when expenses cross total sum of all expenses in a half year is greater than: INR 100.';
    const result = policyService.isExpenseFlagged(description);
    expect(result).toBe(true);
  });
});
