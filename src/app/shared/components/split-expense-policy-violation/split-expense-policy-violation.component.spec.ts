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
      id1: cloneDeep(formattedPolicyViolation1),
      id2: cloneDeep(formattedPolicyViolation2),
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
    expect(component.transactionIDs).toEqual(['id1', 'id2']);
  });

  it('toggleExpansion() should expand the clicked transaction and collapse the others', () => {
    component.toggleExpansion('id1');
    expect(component.policyViolations.id1.isExpanded).toBe(true);
    expect(component.policyViolations.id2.isExpanded).toBe(false);

    component.toggleExpansion('id2');
    expect(component.policyViolations.id1.isExpanded).toBe(false);
    expect(component.policyViolations.id2.isExpanded).toBe(true);
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

    expect(splitExpenseService.postCommentsFromUsers).toHaveBeenCalledOnceWith(['id1', 'id2'], {
      id1: 'comment1',
      id2: 'comment2',
    });
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });
});
