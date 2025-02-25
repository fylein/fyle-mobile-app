import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { PolicyViolationRuleComponent } from '../policy-violation-rule/policy-violation-rule.component';
import { FyCriticalPolicyViolationComponent } from './fy-critical-policy-violation.component';

describe('FyCriticalPolicyViolationComponent', () => {
  let component: FyCriticalPolicyViolationComponent;
  let fixture: ComponentFixture<FyCriticalPolicyViolationComponent>;
  let modalController: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    TestBed.configureTestingModule({
      declarations: [FyCriticalPolicyViolationComponent, PolicyViolationRuleComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
      ],
    }).compileComponents();
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;

    fixture = TestBed.createComponent(FyCriticalPolicyViolationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('cancel(): cancel function should be called from CTA', () => {
    modalController.dismiss.and.resolveTo(false);

    component.cancel();
    expect(modalController.dismiss).toHaveBeenCalledOnceWith(false);
  });

  it('continue(): continue function should be called from CTA', () => {
    modalController.dismiss.and.resolveTo(true);

    component.continue();
    expect(modalController.dismiss).toHaveBeenCalledOnceWith(true);
  });

  it('should check if CTAs are displayed and functional', () => {
    modalController.dismiss.withArgs(true).and.resolveTo(true);
    modalController.dismiss.withArgs(false).and.resolveTo(false);
    spyOn(component, 'cancel').and.callThrough();
    spyOn(component, 'continue').and.callThrough();
    component.showCTA = true;
    fixture.detectChanges();

    const continuButton = getElementBySelector(fixture, '.fy-footer-cta--primary') as HTMLElement;
    const cancelButton = getElementBySelector(fixture, '.fy-footer-cta--tertiary-secondary') as HTMLElement;

    expect(getTextContent(continuButton)).toEqual('Continue');
    expect(getTextContent(cancelButton)).toEqual('Cancel');

    click(continuButton);
    expect(component.continue).toHaveBeenCalledTimes(1);
    click(cancelButton);
    expect(component.cancel).toHaveBeenCalledTimes(1);
  });

  it('should show policy violations', () => {
    component.criticalViolationMessages = ['A violation message'];
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.critical-policy-violation--info'))).toEqual(
      'You cannot report this expense due to the following violation(s):'
    );
    expect(getTextContent(getElementBySelector(fixture, '.inner-content'))).toEqual('A violation message');
  });
});
