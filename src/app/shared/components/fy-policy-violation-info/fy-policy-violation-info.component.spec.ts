import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { FyPolicyViolationInfoComponent } from './fy-policy-violation-info.component';
import { ModalController } from '@ionic/angular/standalone';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { FyCriticalPolicyViolationComponent } from '../fy-critical-policy-violation/fy-critical-policy-violation.component';
import { FyPolicyViolationComponent } from '../fy-policy-violation/fy-policy-violation.component';
import { individualExpPolicyStateData1 } from 'src/app/core/mock-data/individual-expense-policy-state.data';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';
import { PolicyDetail } from 'src/app/core/models/policy-detail.model';

describe('FyPolicyViolationInfoComponent', () => {
  let component: FyPolicyViolationInfoComponent;
  let fixture: ComponentFixture<FyPolicyViolationInfoComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });

    // Setup modal creation spy
    const mockModal = jasmine.createSpyObj('Modal', ['present']);
    modalControllerSpy.create.and.resolveTo(mockModal);
    modalPropertiesSpy.getModalDefaultProperties.and.returnValue({
      cssClass: 'auto-height',
      showBackdrop: true,
      canDismiss: true,
      backdropDismiss: true,
      animated: true,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: false,
    });
    TestBed.configureTestingModule({
      imports: [
        
        MatIconModule,
        MatIconTestingModule,
        TranslocoModule,
        FyPolicyViolationInfoComponent,
      ],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: ModalPropertiesService,
          useValue: modalPropertiesSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyPolicyViolationInfo.policy': 'policy',
        'fyPolicyViolationInfo.violation': 'violation',
        'fyPolicyViolationInfo.violations': 'violations',
        'fyPolicyViolationInfo.found': 'found.',
        'fyPolicyViolationInfo.viewDetails': 'View details',
        'fyPolicyViolationInfo.critical': 'Critical',
        'fyPolicyViolationInfo.criticalViolationNotice':
          'This expense has a critical policy violation. It cannot be added to a report until resolved.',
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
    fixture = TestBed.createComponent(FyPolicyViolationInfoComponent);
    component = fixture.componentInstance;
    component.policyDetails = [individualExpPolicyStateData1] as PolicyDetail[];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show policy violation if critical policy violation is present', () => {
    component.policyViolations = [];
    component.criticalPolicyViolated = true;
    component.ngOnInit();
    expect(component.showPolicyInfo).toBeTrue();
  });

  it('should show policy violation for a single violation', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(getTextContent(getElementBySelector(fixture, '.policy-violation-info--content'))).toEqual(
      'Critical policy violation',
    );
  }));

  it('should open policy violation modal on clicking', fakeAsync(() => {
    component.expense = { unreportable: false } as any;
    fixture.detectChanges();
    tick();
    const viewDetailsButton = getElementBySelector(fixture, '.policy-violation-info--view-more') as HTMLElement;
    expect(getTextContent(viewDetailsButton)).toEqual('View details');
    click(viewDetailsButton);

    expect(modalController.create).toHaveBeenCalledTimes(1);
  }));

  it('should not show the container if there are no policy violations', () => {
    component.policyDetails = null;
    component.showPolicyInfo = false;
    fixture.detectChanges();

    expect(getElementBySelector(fixture, '.policy-violation-info--container')).toBeNull();
  });

  describe('openPolicyViolationDetails():', () => {
    it('should open critical policy violation details', async () => {
      component.criticalPolicyViolated = true;
      component.expense = { unreportable: true } as any;
      fixture.detectChanges();

      component.openPolicyViolationDetails();

      const componentProperties = {
        criticalViolationMessages: component.policyViolations,
        showCTA: false,
        showDragBar: false,
        showCloseIcon: true,
      };

      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: FyCriticalPolicyViolationComponent,
        componentProps: componentProperties,
        cssClass: 'auto-height',
        showBackdrop: true,
        canDismiss: true,
        backdropDismiss: true,
        animated: true,
        initialBreakpoint: 1,
        breakpoints: [0, 1],
        handle: false,
      });
    });

    it('should open policy violation details', async () => {
      component.criticalPolicyViolated = false;
      component.expense = { unreportable: false } as any;
      fixture.detectChanges();

      component.openPolicyViolationDetails();

      const componentProperties = {
        policyViolationMessages: component.policyViolations,
        showComment: false,
        showCTA: false,
        showDragBar: false,
        showCloseIcon: true,
      };

      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: FyPolicyViolationComponent,
        componentProps: componentProperties,
        cssClass: 'auto-height',
        showBackdrop: true,
        canDismiss: true,
        backdropDismiss: true,
        animated: true,
        initialBreakpoint: 1,
        breakpoints: [0, 1],
        handle: false,
      });
    });
  });
});
