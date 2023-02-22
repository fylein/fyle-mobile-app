import { TestBed } from '@angular/core/testing';
import { SpenderPlatformV1BetaApiService } from './spender-platform-v1-beta-api.service';
import { PolicyService } from './policy.service';
import { ApproverPlatformApiService } from './approver-platform-api.service';
import { publicPolicyExpenseData, expensePolicyData } from '../mock-data/policy-service.data';
import {
  platformPolicyExpenseData2,
  expensePolicyStatesData,
  emptyApiResponse,
} from '../mock-data/platform-policy-expense.data';
import { of } from 'rxjs';

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
          useValue: approverPlatformApiServiceSpy,
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

  it('transformTo() : should transform a PublicPolicyExpense to a PlatformPolicyExpense', () => {
    const result = policyService.transformTo(publicPolicyExpenseData);
    expect(result).toEqual(platformPolicyExpenseData2);
  });

  it('getApprovalString(): should return string with emails in bold when given array of emails', () => {
    const emails = ['john.doe@fyle.in', 'jane.doe@fyle.in'];
    const expected = 'Expense will need additional approval from <b>john.doe@fyle.in</b>, <b>jane.doe@fyle.in</b>';

    expect(policyService.getApprovalString(emails)).toEqual(expected);
  });

  it('isPrimaryApproverSkipped(): should return true if the description matches', () => {
    const description = 'Primary approver will be skipped for this expense.';
    const result = policyService.isPrimaryApproverSkipped(description);
    expect(result).toBeTrue();
  });

  it('needAdditionalApproval(): should return true if the description matches', () => {
    const description = 'This expense will need approval from the finance team.';
    const result = policyService.needAdditionalApproval(description);
    expect(result).toBeTrue();
  });

  it('isExpenseCapped(): should return true if thedescription matches', () => {
    const description = 'This expense will be capped to $1000';
    const result = policyService.isExpenseCapped(description);
    expect(result).toBeTrue();
  });

  it('isExpenseFlagged() : should return true for a description that includes expense flag', () => {
    const description =
      ' The expense will be flagged and employee will be alerted when expenses cross total sum of all expenses in a half year is greater than: INR 100.';
    const result = policyService.isExpenseFlagged(description);
    expect(result).toBeTrue();
  });

  it('getCriticalPolicyRules(): should return an empty array if no individual desired state is violated successfully', () => {
    const result = policyService.getCriticalPolicyRules(expensePolicyData);
    expect(result).toEqual([
      'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
    ]);
  });

  it('getPolicyRules(): should get all the policy rules', () => {
    const result = policyService.getPolicyRules(expensePolicyData);
    expect(result).toEqual([
      'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
    ]);
  });

  describe('getSpenderExpensePolicyViolations()', () => {
    it('should get the spender expense policy violations', (done) => {
      spenderPlatformV1BetaApiService.get.and.returnValue(of(expensePolicyStatesData));

      policyService.getSpenderExpensePolicyViolations('txVTmNOp5JEa').subscribe((res) => {
        expect(res).toEqual(expensePolicyStatesData.data[0].individual_desired_states);
        const expectedParams = {
          expense_id: 'eq.txVTmNOp5JEa',
        };
        expect(spenderPlatformV1BetaApiService.get).toHaveBeenCalledOnceWith('/expense_policy_states', {
          params: expectedParams,
        });
        done();
      });
    });

    it('should return an empty array when there are no policy states', (done) => {
      const expenseId = 'noPolicyStates';
      const params = {
        expense_id: `eq.${expenseId}`,
      };
      spenderPlatformV1BetaApiService.get.and.returnValue(of(emptyApiResponse));
      policyService.getSpenderExpensePolicyViolations(expenseId).subscribe((res) => {
        expect(res).toEqual([]);
        expect(spenderPlatformV1BetaApiService.get).toHaveBeenCalledOnceWith('/expense_policy_states', { params });
        done();
      });
    });
  });
});
