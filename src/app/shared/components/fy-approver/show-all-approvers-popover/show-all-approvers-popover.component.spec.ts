import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';

import { ShowAllApproversPopoverComponent } from './show-all-approvers-popover.component';
import { ApprovalState } from 'src/app/core/models/platform/approval-state.enum';
import { getElementRef } from 'src/app/core/dom-helpers';
import { By } from '@angular/platform-browser';
import { EllipsisPipe } from 'src/app/shared/pipes/ellipses.pipe';

describe('ShowAllApproversPopoverComponent', () => {
  let component: ShowAllApproversPopoverComponent;
  let fixture: ComponentFixture<ShowAllApproversPopoverComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);

    TestBed.configureTestingModule({
      declarations: [ShowAllApproversPopoverComponent, EllipsisPipe],
      imports: [IonicModule.forRoot()],
      providers: [{ provide: PopoverController, useValue: popoverControllerSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowAllApproversPopoverComponent);
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call closePopover when close button is clicked', () => {
    spyOn(component, 'closePopover');
    fixture.detectChanges();

    const closeButton = getElementRef(fixture, '.fy-icon-close');
    closeButton.nativeElement.click();

    expect(component.closePopover).toHaveBeenCalled();
  });

  it('should display approval status correctly', () => {
    component.approvals = [
      {
        approver_user_id: 'usvKA4X8Ugcr',
        approver_user: { full_name: 'John Doe', email: 'john@example.com', id: 'usvKA4X8Ugcr' },
        state: ApprovalState.APPROVAL_PENDING,
        approver_order: 0,
      },
      {
        approver_user_id: 'usvKA4X8Ugcr',
        approver_user: { full_name: 'Jane Doe', email: 'jane@example.com', id: 'usvKA4X8Ugcj' },
        state: ApprovalState.APPROVAL_DONE,
        approver_order: 0,
      },
    ];
    fixture.detectChanges();

    const pendingStatus = getElementRef(fixture, '.show-all-approvers-popover__approver-state-pending');
    const doneStatus = getElementRef(fixture, '.show-all-approvers-popover__approver-state-done');

    expect(pendingStatus.nativeElement.textContent).toContain('Approval pending');
    expect(doneStatus.nativeElement.textContent).toContain('Approved');
  });

  it('should display correct step numbers in the stepper', () => {
    component.approvals = [
      {
        approver_user_id: 'usvKA4X8Ugcr',
        approver_user: { full_name: 'John Doe', email: 'john@example.com', id: 'usvKA4X8Ugcr' },
        state: ApprovalState.APPROVAL_PENDING,
        approver_order: 0,
      },
      {
        approver_user_id: 'usvKA4X8Ugcj',
        approver_user: { full_name: 'Jane Doe', email: 'jane@example.com', id: 'usvKA4X8Ugcj' },
        state: ApprovalState.APPROVAL_DONE,
        approver_order: 0,
      },
      {
        approver_user_id: 'usvKA4X8Ugcm',
        approver_user: { full_name: 'Mark Smith', email: 'mark@example.com', id: 'usvKA4X8Ugcm' },
        state: ApprovalState.APPROVAL_PENDING,
        approver_order: 0,
      },
    ];
    fixture.detectChanges();

    const stepNumbers = fixture.debugElement.queryAll(By.css('.show-all-approvers-popover__approver-step-number'));

    expect(stepNumbers.length).toBe(3);
    expect(stepNumbers[0].nativeElement.textContent.trim()).toBe('1');
    expect(stepNumbers[1].nativeElement.textContent.trim()).toBe('2');
    expect(stepNumbers[2].nativeElement.textContent.trim()).toBe('3');
  });

  it('closePopover(): should call closePopover when invoked', () => {
    component.closePopover();
    expect(popoverController.dismiss).toHaveBeenCalled();
  });
});
