import { TestBed } from '@angular/core/testing';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PolicyService } from './policy.service';
import { ApproverPlatformApiService } from './approver-platform-api.service';
import {
  publicPolicyExpenseData1,
  expensePolicyData,
  policyViolationData,
  violations,
  publicPolicyExpenseData2,
  publicPolicyExpenseData3,
  publicPolicyExpenseData4,
  publicPolicyExpenseData5,
  publicPolicyExpenseData6,
  publicPolicyExpenseData7,
} from '../mock-data/public-policy-expense.data';
import {
  ApproverExpensePolicyStatesData,
  platformPolicyExpenseData2,
  expensePolicyStatesData,
  emptyApiResponse,
  platformPolicyExpenseData3,
  platformPolicyExpenseData4,
  platformPolicyExpenseData5,
} from '../mock-data/platform-policy-expense.data';
import { of } from 'rxjs';

describe('PolicyService', () => {
  let policyService: PolicyService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let approverPlatformApiService: jasmine.SpyObj<ApproverPlatformApiService>;

  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']);
    const approverPlatformApiServiceSpy = jasmine.createSpyObj('ApproverPlatformApiService', ['get']);
    TestBed.configureTestingModule({
      providers: [
        PolicyService,
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
        {
          provide: ApproverPlatformApiService,
          useValue: approverPlatformApiServiceSpy,
        },
      ],
    });
    policyService = TestBed.inject(PolicyService);
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    approverPlatformApiService = TestBed.inject(
      ApproverPlatformApiService
    ) as jasmine.SpyObj<ApproverPlatformApiService>;
  });

  it(' should be created', () => {
    expect(policyService).toBeTruthy();
  });

  describe('transformTo():', () => {
    it('should transform a PublicPolicyExpense to a PlatformPolicyExpense', () => {
      const result = policyService.transformTo(publicPolicyExpenseData1);
      expect(result).toEqual(platformPolicyExpenseData2);
    });

    it('should check for the category to be airlines', () => {
      const result = policyService.transformTo(publicPolicyExpenseData2);
      expect(result).toEqual(platformPolicyExpenseData2);
    });

    it('should check for the category to be bus', () => {
      const result = policyService.transformTo(publicPolicyExpenseData3);
      expect(result).toEqual(platformPolicyExpenseData3);
    });

    it('should check for the category to be train', () => {
      const result = policyService.transformTo(publicPolicyExpenseData4);
      expect(result).toEqual(platformPolicyExpenseData4);
    });

    it('should return null if reimbersment status is null', () => {
      const result = policyService.transformTo(publicPolicyExpenseData5);
      expect(result).toEqual(platformPolicyExpenseData5);
    });

    it('should filter out null values from location array', () => {
      const result = policyService.transformTo(publicPolicyExpenseData6);
      expect(result.locations).toBeUndefined();
    });

    it('should return empty array if the fyle category is null', () => {
      const result = policyService.transformTo(publicPolicyExpenseData7);
      expect(result.travel_classes).toEqual([]);
    });
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

  it('isExpenseFlagged(): should return true for a description that includes expense flag', () => {
    const description =
      'The expense will be flagged and employee will be alerted when expenses cross total sum of all expenses in a half year is greater than: INR 100.';
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

  describe('getSpenderExpensePolicyViolations():', () => {
    it('should get the spender expense policy violations', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(expensePolicyStatesData));

      policyService.getSpenderExpensePolicyViolations('txVTmNOp5JEa').subscribe((res) => {
        expect(res).toEqual(expensePolicyStatesData.data[0].individual_desired_states);
        const expectedParams = {
          expense_id: 'eq.txVTmNOp5JEa',
        };
        expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/expense_policy_states', {
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
      spenderPlatformV1ApiService.get.and.returnValue(of(emptyApiResponse));
      policyService.getSpenderExpensePolicyViolations(expenseId).subscribe((res) => {
        expect(res).toEqual([]);
        expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/expense_policy_states', { params });
        done();
      });
    });
  });

  describe('getApproverExpensePolicyViolations():', () => {
    it('should get approver expense policy violations', (done) => {
      const params = {
        expense_id: 'eq.txRNWeQRXhso',
      };
      approverPlatformApiService.get.and.returnValue(of(ApproverExpensePolicyStatesData));
      policyService.getApproverExpensePolicyViolations('txRNWeQRXhso').subscribe((res) => {
        expect(res).toEqual(ApproverExpensePolicyStatesData.data[0].individual_desired_states);
        expect(approverPlatformApiService.get).toHaveBeenCalledOnceWith('/expense_policy_states', {
          params,
        });
        done();
      });
    });

    it('should return an empty array when there are no policy states', (done) => {
      const expenseId = 'noPolicyStates';
      const params = {
        expense_id: `eq.${expenseId}`,
      };
      approverPlatformApiService.get.and.returnValue(of(emptyApiResponse));
      policyService.getApproverExpensePolicyViolations(expenseId).subscribe((res) => {
        expect(res).toEqual([]);
        expect(approverPlatformApiService.get).toHaveBeenCalledOnceWith('/expense_policy_states', { params });
        done();
      });
    });
  });

  it('checkIfViolationsExist(): should check for policy violations', () => {
    spyOn(policyService, 'getPolicyRules').and.returnValue([]);
    expect(policyService.checkIfViolationsExist(violations)).toBe(false);
    expect(policyService.getPolicyRules).toHaveBeenCalledOnceWith(policyViolationData);
  });
});
