import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SplitExpensePolicyViolationComponent } from './split-expense-policy-violation.component';
import {
  formattedPolicyViolation1,
  formattedPolicyViolation2,
} from 'src/app/core/mock-data/formatted-policy-violation.data';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SplitExpenseService } from 'src/app/core/services/split-expense.service';
import { of } from 'rxjs';
import { cloneDeep } from 'lodash';
import {
  filteredSplitPolicyViolationsData,
  filteredSplitPolicyViolationsData2,
} from 'src/app/core/mock-data/filtered-split-policy-violations.data';
import {
  filteredMissingFieldsViolationsData,
  filteredMissingFieldsViolationsData2,
} from 'src/app/core/mock-data/filtered-missing-fields-violations.data';

describe('SplitExpensePolicyViolationComponent', () => {
  let component: SplitExpensePolicyViolationComponent;
  let fixture: ComponentFixture<SplitExpensePolicyViolationComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let splitExpenseService: jasmine.SpyObj<SplitExpenseService>;
  let comments: FormArray;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const splitExpenseServiceSpy = jasmine.createSpyObj('SplitExpenseService', ['postCommentsFromUsers']);
    TestBed.configureTestingModule({
      declarations: [SplitExpensePolicyViolationComponent],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        FormBuilder,
        {
          provide: SplitExpenseService,
          useValue: splitExpenseServiceSpy,
        },
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SplitExpensePolicyViolationComponent);
    component = fixture.componentInstance;
    splitExpenseService = TestBed.inject(SplitExpenseService) as jasmine.SpyObj<SplitExpenseService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    component.policyViolations = {
      0: cloneDeep(filteredSplitPolicyViolationsData),
      1: cloneDeep(filteredSplitPolicyViolationsData2),
    };
    component.missingFieldsViolations = {
      0: cloneDeep(filteredMissingFieldsViolationsData),
    };
    comments = component.form.controls.comments as FormArray;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should initialize the form with empty comments and set transactionIDs', () => {
    spyOn(component, 'ngOnInit');
    const firstComment = comments.at(0).get('comment');
    const secondComment = comments.at(1).get('comment');
    component.ngOnInit();
    expect(comments.length).toBe(2);
    expect(firstComment.value).toBe('');
    expect(secondComment.value).toBe('');
    expect(component.transactionIDs).toEqual(['0', '1']);
    expect(component.missingFieldsIDs).toEqual(['0']);
  });

  it('toggleExpansion() should expand the clicked transaction and collapse the others', () => {
    component.toggleExpansion('0');
    expect(component.policyViolations[0].isExpanded).toBeTrue();
    expect(component.policyViolations[1].isExpanded).toBeFalse();

    component.toggleExpansion('1');
    expect(component.policyViolations[0].isExpanded).toBeFalse();
    expect(component.policyViolations[1].isExpanded).toBeTrue();
  });

  it('cancel() should dismiss the modal', () => {
    component.cancel();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('should post comments from users and dismiss the modal', () => {
    comments.at(0).get('comment').setValue('comment1');
    comments.at(1).get('comment').setValue('comment2');
    splitExpenseService.postCommentsFromUsers.and.returnValue(of(null));

    component.continue();

    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('hidePolicyViolations(): should hide the policy violations in the modal if for that ID missing fields is present', () => {
    component.policyViolations = cloneDeep({
      0: filteredSplitPolicyViolationsData,
      1: filteredSplitPolicyViolationsData2,
    });
    component.transactionIDs = ['0', '1'];
    component.missingFieldsViolations = cloneDeep({
      0: { ...filteredMissingFieldsViolationsData, isMissingFields: true },
    });
    component.hidePolicyViolations();
    expect(component.policyViolations[0]).toBeUndefined();
    expect(component.isSplitBlocked).toBeTrue();
  });

  describe('checkIfSplitBlocked():', () => {
    it('should set isSplitBlocked to true if critical policy violations are present and report is attached', () => {
      component.isPartOfReport = true;
      component.transactionIDs = ['0', '1', '2'];
      component.policyViolations = cloneDeep({
        0: filteredSplitPolicyViolationsData,
        1: filteredSplitPolicyViolationsData2,
      });
      component.checkIfSplitBlocked();
      expect(component.isSplitBlocked).toBeTrue();
    });

    it('should set isSplitBlocked to true if missing fields are present', () => {
      component.isPartOfReport = true;
      component.missingFieldsIDs = ['0', '1', '2'];
      component.missingFieldsViolations = cloneDeep({
        0: { ...filteredMissingFieldsViolationsData, isMissingFields: true },
      });
      component.checkIfSplitBlocked();
      expect(component.isSplitBlocked).toBeTrue();
    });
  });

  it('toggleMissingFieldsExpansion() should expand the clicked transaction missing fields and collapse the others', () => {
    component.missingFieldsViolations = {
      0: cloneDeep(filteredMissingFieldsViolationsData),
      1: cloneDeep({ ...filteredMissingFieldsViolationsData2, isExpanded: false }),
    };
    component.toggleMissingFieldsExpansion('0');
    expect(component.missingFieldsViolations[0].isExpanded).toBeTrue();
    expect(component.missingFieldsViolations[1].isExpanded).toBeFalse();

    component.toggleMissingFieldsExpansion('1');
    expect(component.missingFieldsViolations[0].isExpanded).toBeFalse();
    expect(component.missingFieldsViolations[1].isExpanded).toBeTrue();
  });
});
