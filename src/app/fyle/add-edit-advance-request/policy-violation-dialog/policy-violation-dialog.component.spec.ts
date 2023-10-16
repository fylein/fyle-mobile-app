import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { click, getElementBySelector } from 'src/app/core/dom-helpers';
import { PolicyViolationDialogComponent } from './policy-violation-dialog.component';

describe('PolicyViolationDialogComponent', () => {
  let policyViolationDialogComponent: PolicyViolationDialogComponent;
  let modalController: jasmine.SpyObj<ModalController>;
  let fixture: ComponentFixture<PolicyViolationDialogComponent>;

  beforeEach(waitForAsync(() => {
    modalController = jasmine.createSpyObj('ModalController', ['dismiss']);

    TestBed.configureTestingModule({
      declarations: [PolicyViolationDialogComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, FormsModule],
      providers: [{ provide: ModalController, useValue: modalController }],
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyViolationDialogComponent);
    policyViolationDialogComponent = fixture.componentInstance;
    policyViolationDialogComponent.latestComment = 'This is a comment';
    policyViolationDialogComponent.violatedPolicyRules = ['rule1', 'rule2'];
    policyViolationDialogComponent.policyViolationActionDescription =
      'The expense will be flagged, employee will be alerted, expense will be made unreportable and expense amount will be capped to the amount limit when expense amount in category 1 / chumma returns/1 / sd/1 / sub 123/aniruddha test / aniruddha sub/Food/Food / Travelling - Inland/Snacks/Stuff/te knklw/TEst Cateogory / 12 exceeds: INR 1000 and are fyled from  Paid by Employee payment mode(s). ';
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(policyViolationDialogComponent).toBeTruthy();
  });

  it('should set newComment property to latestComment property in ngOnInit', () => {
    policyViolationDialogComponent.ngOnInit();
    expect(policyViolationDialogComponent.newComment).toEqual(policyViolationDialogComponent.latestComment);
  });

  it('should call dismiss() in closePolicyModal method', () => {
    policyViolationDialogComponent.closePolicyModal();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('should dismiss the modal controller with a reason', () => {
    policyViolationDialogComponent.newComment = 'Violation comment';
    policyViolationDialogComponent.continueWithPolicyViolation();
    expect(modalController.dismiss).toHaveBeenCalledWith({ reason: 'Violation comment' });
  });

  it('should display proper policy title and header', () => {
    const policyTitle = getElementBySelector(fixture, '.policy-violation--toolbar__title');
    expect(policyTitle.textContent).toEqual('Policy Violated');
    const policyHeader = getElementBySelector(fixture, '.policy-violation--header');
    expect(policyHeader.textContent).toEqual(
      ' This expense falls outside the guidelines of your company’s policy. Please contact your admin for any clarifications. '
    );
  });

  it('should trigger the correct methods when buttons are clicked', waitForAsync(() => {
    spyOn(policyViolationDialogComponent, 'closePolicyModal');
    spyOn(policyViolationDialogComponent, 'continueWithPolicyViolation');

    fixture.detectChanges();
    //tests involving clicking on buttons are executed only after the policyViolationDialogComponent has been initialized
    fixture.whenStable().then(() => {
      const cancelButton = getElementBySelector(fixture, '.fy-footer-cta--tertiary-secondary') as HTMLElement;
      click(cancelButton);
      expect(policyViolationDialogComponent.closePolicyModal).toHaveBeenCalledTimes(1);

      const continueButton = getElementBySelector(fixture, '.fy-footer-cta--primary') as HTMLElement;
      click(continueButton);
      expect(policyViolationDialogComponent.continueWithPolicyViolation).toHaveBeenCalledTimes(1);
    });
  }));
});
