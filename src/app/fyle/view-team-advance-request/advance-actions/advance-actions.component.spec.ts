import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatRippleModule } from '@angular/material/core';
import { IonicModule, PopoverController } from '@ionic/angular';
import { getAllElementsBySelector, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

import { AdvanceActionsComponent } from './advance-actions.component';

describe('AdvanceActionsComponent', () => {
  let component: AdvanceActionsComponent;
  let fixture: ComponentFixture<AdvanceActionsComponent>;
  let popoverControllerSpy: PopoverController;

  beforeEach(waitForAsync(() => {
    popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    TestBed.configureTestingModule({
      declarations: [AdvanceActionsComponent],
      imports: [IonicModule.forRoot(), MatRippleModule],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdvanceActionsComponent);
    component = fixture.componentInstance;
    component.actions = {
      can_approve: true,
      can_inquire: true,
      can_reject: true,
    };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Show advance action buttons', () => {
    it('should show Approve Advance action button if can_approve is true', () => {
      component.actions = {
        can_approve: true,
        can_inquire: false,
        can_reject: false,
      };
      fixture.detectChanges();
      const approveButton = getElementBySelector(fixture, '.advance-action--action-head');
      expect(getTextContent(approveButton)).toContain('Approve Advance');
    });

    it('should show Reject Advance action button if can_reject is true', () => {
      component.actions = {
        can_approve: false,
        can_inquire: false,
        can_reject: true,
      };
      fixture.detectChanges();
      const rejectButton = getElementBySelector(fixture, '.advance-action--action-head');
      expect(getTextContent(rejectButton)).toContain('Reject Advance');
    });

    it('should show Send back Advance action button if can_inquire is true', () => {
      component.actions = {
        can_approve: false,
        can_inquire: true,
        can_reject: false,
      };
      fixture.detectChanges();
      const inquireButton = getElementBySelector(fixture, '.advance-action--action-head');
      expect(getTextContent(inquireButton)).toContain('Send Back Advance');
    });

    it('should show all 3 advance action buttons if all can_approve, can_inquire and can_reject are true', () => {
      component.actions = {
        can_approve: true,
        can_inquire: true,
        can_reject: true,
      };
      fixture.detectChanges();
      const actionsEl = getAllElementsBySelector(fixture, '.advance-action--action-head');
      expect(getTextContent(actionsEl[0])).toContain('Approve Advance');
      expect(getTextContent(actionsEl[1])).toContain('Send Back Advance');
      expect(getTextContent(actionsEl[2])).toContain('Reject Advance');
    });
  });

  describe('openAnotherPopover():', () => {
    it('should dismiss popover with the sendBackAdvance command when send back action button is clicked', () => {
      const mockCommand = 'sendBackAdvance';
      // @ts-ignore
      component.popoverController.dismiss.and.returnValue(Promise.resolve());
      const sendBackButton = getElementBySelector(fixture, '.advance-action--action') as HTMLElement;
      sendBackButton.click();
      component.openAnotherPopover(mockCommand);
      // @ts-ignore
      expect(component.popoverController.dismiss).toHaveBeenCalledWith({ command: mockCommand });
    });

    it('should dismiss popover with the approveAdvance command when approve advance action button is clicked', () => {
      const mockCommand = 'approveAdvance';
      // @ts-ignore
      component.popoverController.dismiss.and.returnValue(Promise.resolve());
      const approveButton = getElementBySelector(fixture, '.advance-action--action') as HTMLElement;
      approveButton.click();
      component.openAnotherPopover(mockCommand);
      // @ts-ignore
      expect(component.popoverController.dismiss).toHaveBeenCalledWith({ command: mockCommand });
    });

    it('should dismiss popover with the rejectAdvance command when reject advance action button is clicked', () => {
      const mockCommand = 'rejectAdvance';
      // @ts-ignore
      component.popoverController.dismiss.and.returnValue(Promise.resolve());
      const rejectButton = getElementBySelector(fixture, '.advance-action--action') as HTMLElement;
      rejectButton.click();
      component.openAnotherPopover(mockCommand);
      // @ts-ignore
      expect(component.popoverController.dismiss).toHaveBeenCalledWith({ command: mockCommand });
    });
  });
});
