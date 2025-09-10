import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { ModalController } from '@ionic/angular/standalone';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SplitExpensePolicyViolationComponent } from './split-expense-policy-violation.component';
import { UntypedFormArray, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { cloneDeep } from 'lodash';
import {
  filteredSplitPolicyViolationsData,
  filteredSplitPolicyViolationsData2,
} from 'src/app/core/mock-data/filtered-split-policy-violations.data';
import { of } from 'rxjs';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('SplitExpensePolicyViolationComponent', () => {
  let component: SplitExpensePolicyViolationComponent;
  let fixture: ComponentFixture<SplitExpensePolicyViolationComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let comments: UntypedFormArray;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TranslocoModule, SplitExpensePolicyViolationComponent,
        MatIconTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        UntypedFormBuilder,
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SplitExpensePolicyViolationComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    component.policyViolations = {
      0: cloneDeep(filteredSplitPolicyViolationsData),
      1: cloneDeep(filteredSplitPolicyViolationsData2),
    };
    comments = component.form.controls.comments as UntypedFormArray;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'splitExpensePolicyViolation.policyViolationFound': 'Policy Violation Found',
        'splitExpensePolicyViolation.expenseCannotBeSplit': 'Expense cannot be split',
        'splitExpensePolicyViolation.splitBlockedMessage': 'Expense cannot be split as it violates policies.',
        'splitExpensePolicyViolation.resolveViolationsMessage': 'Resolve the violations before splitting.',
        'splitExpensePolicyViolation.critical': 'Critical',
        'splitExpensePolicyViolation.policyViolation': 'Policy Violation',
        'splitExpensePolicyViolation.pluralS': '(s)',
        'splitExpensePolicyViolation.additionalDetailsHeader': 'Please provide additional details for approval',
        'splitExpensePolicyViolation.detailsPlaceholder': 'Enter the details here',
        'splitExpensePolicyViolation.cancel': 'Cancel',
        'splitExpensePolicyViolation.continue': 'Continue',
        'splitExpensePolicyViolation.gotIt': 'Got it',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
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

    component.continue();

    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
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
  });
});
