import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SplitExpensePolicyViolationComponent } from './split-expense-policy-violation.component';
import { UntypedFormArray, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { cloneDeep } from 'lodash';
import {
  filteredSplitPolicyViolationsData,
  filteredSplitPolicyViolationsData2,
} from 'src/app/core/mock-data/filtered-split-policy-violations.data';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { getTranslocoTestingModule } from 'src/app/core/testing/transloco-testing.utils';
import { CurrencyPipe } from '@angular/common';

describe('SplitExpensePolicyViolationComponent', () => {
  let component: SplitExpensePolicyViolationComponent;
  let fixture: ComponentFixture<SplitExpensePolicyViolationComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let comments: UntypedFormArray;
  beforeEach(waitForAsync(() => {
    const currencyPipeSpy = jasmine.createSpyObj('CurrencyPipe', ['transform']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    TestBed.configureTestingModule({
      imports: [getTranslocoTestingModule(), SplitExpensePolicyViolationComponent,
        MatIconTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        UntypedFormBuilder,
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: CurrencyPipe,
          useValue: currencyPipeSpy,
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
