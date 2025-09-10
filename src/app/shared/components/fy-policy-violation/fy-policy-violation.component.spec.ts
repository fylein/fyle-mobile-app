import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { ModalController } from '@ionic/angular/standalone';

import { FyPolicyViolationComponent } from './fy-policy-violation.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PolicyService } from 'src/app/core/services/policy.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('FyPolicyViolationComponent', () => {
  let component: FyPolicyViolationComponent;
  let fixture: ComponentFixture<FyPolicyViolationComponent>;
  let policyService: jasmine.SpyObj<PolicyService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const policyServiceSpy = jasmine.createSpyObj('PolicyService', ['getApprovalString']);
    const utilityServiceSpy = jasmine.createSpyObj('UtilityService', [
      'getEmailsFromString',
      'getAmountWithCurrencyFromString',
    ]);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      providers: [
        {
          provide: PolicyService,
          useValue: policyServiceSpy,
        },
        {
          provide: UtilityService,
          useValue: utilityServiceSpy,
        },
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
      imports: [IonicModule.forRoot(), FormsModule, ReactiveFormsModule, TranslocoModule, FyPolicyViolationComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FyPolicyViolationComponent);
    component = fixture.componentInstance;
    policyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyPolicyViolation.cappedTo': 'Expense will be capped to {{amount}}',
        'fyPolicyViolation.singleViolationFound': 'Policy violation found',
        'fyPolicyViolation.multipleViolationsFound': 'Policy violations found',
        'fyPolicyViolation.policyActionHeader': 'The policy violation will trigger the following action(s):',
        'fyPolicyViolation.flaggedMessage': 'Expense will be flagged for verification and approval',
        'fyPolicyViolation.skippedMessage': 'Primary approver will be skipped',
        'fyPolicyViolation.additionalDetailsHeader': 'Please provide additional details for approval',
        'fyPolicyViolation.detailsPlaceholder': 'Enter the details here',
        'fyPolicyViolation.cancel': 'Cancel',
        'fyPolicyViolation.continue': 'Continue',
      };
      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{{${paramKey}}}`;
          translation = translation.replace(placeholder, params[paramKey]);
        });
      }

      return translation;
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(): should update the form, isExpenseFlagged, isPrimaryApproverSkipped, needAdditionalApproval and isExpenseCapped', () => {
    component.policyAction = {
      add_approver_user_ids: ['approver_id_1', 'approver_id_2'],
      amount: 1200,
      flag: true,
      is_receipt_mandatory: true,
      remove_employee_approver1: true,
      run_status: 'SUCCESS',
      run_summary: ['REPORTED', 'expenses will be capped to 2000', 'PROCESSING', 'SUCCESS'],
    };
    spyOn(component, 'constructAdditionalApproverAction');
    spyOn(component, 'constructCappingAction');
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.form).toBeDefined();
    expect(component.form.get('comment')).toBeDefined();
    expect(component.form.get('comment').value).toBe('');
    expect(component.isExpenseFlagged).toBeTrue();
    expect(component.isPrimaryApproverSkipped).toBeTrue();
    expect(component.needAdditionalApproval).toBeTrue();
    expect(component.isExpenseCapped).toBeTrue();
    expect(component.constructAdditionalApproverAction).toHaveBeenCalledTimes(1);
    expect(component.constructCappingAction).toHaveBeenCalledTimes(1);
  });

  it('constructAdditionalApproverAction(): should update approverEmailsRequiredMsg if run_summary contains a particular value', () => {
    component.needAdditionalApproval = true;
    component.policyAction = {
      add_approver_user_ids: ['approver_id_1', 'approver_id_2'],
      amount: 1200,
      flag: true,
      is_receipt_mandatory: true,
      remove_employee_approver1: true,
      run_status: 'SUCCESS',
      run_summary: [
        'REPORTED',
        'expense will need approval from ajain@fyle.in, aiyush.dhar@fyle.in',
        'PROCESSING',
        'SUCCESS',
      ],
    };
    utilityService.getEmailsFromString.and.returnValue(['ajain@fyle.in', 'aiyush.dhar@fyle.in']);
    policyService.getApprovalString.and.returnValue(
      'Expense will need additional approval from ajain@fyle.in, aiyush.dhar@fyle.in',
    );
    component.constructAdditionalApproverAction();
    fixture.detectChanges();
    expect(utilityService.getEmailsFromString).toHaveBeenCalledOnceWith(
      'expense will need approval from ajain@fyle.in, aiyush.dhar@fyle.in',
    );
    expect(component.approverEmailsRequiredMsg).toEqual(
      'Expense will need additional approval from ajain@fyle.in, aiyush.dhar@fyle.in',
    );
  });

  it('constructCappingAction(): should update cappedAmountString if run_summary contains a particular value', () => {
    component.isExpenseCapped = true;
    component.policyAction = {
      add_approver_user_ids: ['approver_id_1', 'approver_id_2'],
      amount: 1200,
      flag: true,
      is_receipt_mandatory: true,
      remove_employee_approver1: true,
      run_status: 'SUCCESS',
      run_summary: ['REPORTED', 'expense will be capped to INR 2000', 'PROCESSING', 'SUCCESS'],
    };
    utilityService.getAmountWithCurrencyFromString.and.returnValue(['capped to INR 2000', 'INR 2000']);
    component.constructCappingAction();
    fixture.detectChanges();
    expect(component.cappedAmountString).toEqual('Expense will be capped to ₹2000');
  });

  it('cancel(): should dismiss the modal', () => {
    component.cancel();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('continue(): should dismiss the modal with comment equal to form.comment', () => {
    component.continue();
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({
      comment: '',
    });
  });
});
