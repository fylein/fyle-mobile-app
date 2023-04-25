import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { click, getElementBySelector } from 'src/app/core/dom-helpers';
import { expenseList2 } from 'src/app/core/mock-data/expense.data';
import { FyAlertInfoComponent } from '../fy-alert-info/fy-alert-info.component';
import { PopupAlertComponent } from './popup-alert.component';

describe('PopupAlertComponent', () => {
  let component: PopupAlertComponent;
  let fixture: ComponentFixture<PopupAlertComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    TestBed.configureTestingModule({
      declarations: [PopupAlertComponent, FyAlertInfoComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PopupAlertComponent);
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    component = fixture.componentInstance;
    component.primaryCta = {
      text: 'Test Primary CTA',
      action: 'Success',
      type: 'alert',
    };
    component.secondaryCta = {
      text: 'Test Secondary CTA',
      action: 'Cancel',
      type: 'secondary',
    };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    xit('should set numIssues when expense is flagged manually or by policy', () => {
      component.etxns = expenseList2;
      fixture.detectChanges();
      component.ngOnInit();
      expect(component.numIssues).toEqual(2);
    });

    it('should not set numIssues when expense is not flagged manually or by policy', () => {
      component.etxns = expenseList2.map((etxn) => {
        etxn.tx_policy_flag = false;
        etxn.tx_manual_flag = false;
        return etxn;
      });
      fixture.detectChanges();
      component.ngOnInit();
      expect(component.numIssues).toEqual(0);
    });
  });

  describe('ctaClickedEvent():', () => {
    it('should dismiss popover with action when primary cta is clicked', () => {
      const primaryCtaEl = getElementBySelector(fixture, '.popup-alert--primary-cta') as HTMLButtonElement;
      click(primaryCtaEl);
      expect(popoverController.dismiss).toHaveBeenCalledOnceWith({
        action: 'Success',
      });
    });

    it('should dismiss popover with action when secondary cta is clicked', () => {
      const secondaryCtaEl = getElementBySelector(fixture, '.popup-alert--secondary-cta') as HTMLButtonElement;
      click(secondaryCtaEl);
      expect(popoverController.dismiss).toHaveBeenCalledOnceWith({
        action: 'Cancel',
      });
    });
  });
});
