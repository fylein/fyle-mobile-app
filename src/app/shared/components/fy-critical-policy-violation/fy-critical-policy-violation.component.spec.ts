import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { ModalController } from '@ionic/angular/standalone';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { PolicyViolationRuleComponent } from '../policy-violation-rule/policy-violation-rule.component';
import { FyCriticalPolicyViolationComponent } from './fy-critical-policy-violation.component';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('FyCriticalPolicyViolationComponent', () => {
  let component: FyCriticalPolicyViolationComponent;
  let fixture: ComponentFixture<FyCriticalPolicyViolationComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
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
      imports: [
        
        MatIconModule,
        MatIconTestingModule,
        TranslocoModule,
        FyCriticalPolicyViolationComponent,
        PolicyViolationRuleComponent,
      ],
      providers: [
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
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;

    fixture = TestBed.createComponent(FyCriticalPolicyViolationComponent);
    component = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyCriticalPolicyViolation.expenseBlocked': 'Expense blocked',
        'fyCriticalPolicyViolation.cannotReportWarning':
          'You cannot report this expense due to the following violation(s):',
        'fyCriticalPolicyViolation.splitIncompleteMissingReceipt':
          'Splitting this expense will create incomplete expenses since receipt is missing.',
        'fyCriticalPolicyViolation.splitIncomplete': 'Splitting this expense will create incomplete expenses.',
        'fyCriticalPolicyViolation.removeAndSplit':
          'Please remove this expense from the report and split it from the Expenses section.',
        'fyCriticalPolicyViolation.splitBlocked': 'Splitting this expense will create blocked expenses.',
        'fyCriticalPolicyViolation.cancel': 'Cancel',
        'fyCriticalPolicyViolation.continue': 'Continue',
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
      'You cannot report this expense due to the following violation(s):',
    );
    expect(getTextContent(getElementBySelector(fixture, '.policy-violation-rule--container div'))).toEqual(
      'A violation message',
    );
  });
});
