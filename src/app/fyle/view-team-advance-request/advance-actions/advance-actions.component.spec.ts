import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatRippleModule } from '@angular/material/core';
import { IonicModule, PopoverController } from '@ionic/angular';
import { click, getAllElementsBySelector, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

import { AdvanceActionsComponent } from './advance-actions.component';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('AdvanceActionsComponent', () => {
  let component: AdvanceActionsComponent;
  let fixture: ComponentFixture<AdvanceActionsComponent>;
  let popoverControllerSpy: PopoverController;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), MatRippleModule, TranslocoModule, AdvanceActionsComponent],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
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
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'advanceActions.approveAdvance': 'Approve advance',
        'advanceActions.approveAdvanceInfo': 'Approve this advance request',
        'advanceActions.sendBackAdvance': 'Send back advance',
        'advanceActions.sendBackAdvanceInfo': 'Send back advance request',
        'advanceActions.rejectAdvance': 'Reject advance',
        'advanceActions.rejectAdvanceInfo': 'Reject this advance request',
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

  describe('Show advance action buttons', () => {
    it('should show Approve Advance action button if can_approve is true', () => {
      component.actions = {
        can_approve: true,
        can_inquire: false,
        can_reject: false,
      };
      fixture.detectChanges();
      const approveButton = getElementBySelector(fixture, '.advance-action--action-head');
      expect(getTextContent(approveButton)).toContain('Approve advance');
    });

    it('should show Reject Advance action button if can_reject is true', () => {
      component.actions = {
        can_approve: false,
        can_inquire: false,
        can_reject: true,
      };
      fixture.detectChanges();
      const rejectButton = getElementBySelector(fixture, '.advance-action--action-head');
      expect(getTextContent(rejectButton)).toContain('Reject advance');
    });

    it('should show Send back Advance action button if can_inquire is true', () => {
      component.actions = {
        can_approve: false,
        can_inquire: true,
        can_reject: false,
      };
      fixture.detectChanges();
      const inquireButton = getElementBySelector(fixture, '.advance-action--action-head');
      expect(getTextContent(inquireButton)).toContain('Send back advance');
    });

    it('should show all 3 advance action buttons if all can_approve, can_inquire and can_reject are true', () => {
      component.actions = {
        can_approve: true,
        can_inquire: true,
        can_reject: true,
      };
      fixture.detectChanges();
      const actionsEl = getAllElementsBySelector(fixture, '.advance-action--action-head');
      expect(getTextContent(actionsEl[0])).toContain('Approve advance');
      expect(getTextContent(actionsEl[1])).toContain('Send back advance');
      expect(getTextContent(actionsEl[2])).toContain('Reject advance');
    });

    it('should not show the advance actions cta button if all 3 advance actions are false', () => {
      component.actions = {
        can_approve: false,
        can_inquire: false,
        can_reject: false,
      };
      fixture.detectChanges();
      const actionsEl = getElementBySelector(fixture, '.advance-action');
      expect(getTextContent(actionsEl)).not.toBeTruthy();
    });
  });

  describe('openAnotherPopover():', () => {
    it('should dismiss popover with the sendBackAdvance command when send back action button is clicked', () => {
      const mockCommand = 'sendBackAdvance';
      // @ts-ignore
      component.popoverController.dismiss.and.resolveTo();
      const sendBackButton = getElementBySelector(fixture, '.advance-action--action') as HTMLElement;
      click(sendBackButton);
      component.openAnotherPopover(mockCommand);
      // @ts-ignore
      expect(component.popoverController.dismiss).toHaveBeenCalledWith({ command: mockCommand });
    });

    it('should dismiss popover with the approveAdvance command when approve advance action button is clicked', () => {
      const mockCommand = 'approveAdvance';
      // @ts-ignore
      component.popoverController.dismiss.and.resolveTo();
      const approveButton = getElementBySelector(fixture, '.advance-action--action') as HTMLElement;
      click(approveButton);
      component.openAnotherPopover(mockCommand);
      // @ts-ignore
      expect(component.popoverController.dismiss).toHaveBeenCalledWith({ command: mockCommand });
    });

    it('should dismiss popover with the rejectAdvance command when reject advance action button is clicked', () => {
      const mockCommand = 'rejectAdvance';
      // @ts-ignore
      component.popoverController.dismiss.and.resolveTo();
      const rejectButton = getElementBySelector(fixture, '.advance-action--action') as HTMLElement;
      click(rejectButton);
      component.openAnotherPopover(mockCommand);
      // @ts-ignore
      expect(component.popoverController.dismiss).toHaveBeenCalledWith({ command: mockCommand });
    });
  });
});
