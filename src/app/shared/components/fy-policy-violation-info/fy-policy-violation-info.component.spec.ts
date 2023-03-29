import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { FyPolicyViolationInfoComponent } from './fy-policy-violation-info.component';
import { ModalController } from '@ionic/angular';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { FyCriticalPolicyViolationComponent } from '../fy-critical-policy-violation/fy-critical-policy-violation.component';
import { FyPolicyViolationComponent } from '../fy-policy-violation/fy-policy-violation.component';
import {
  individualExpPolicyStateData1,
  individualExpPolicyStateData2,
} from 'src/app/core/mock-data/individual-expense-policy-state.data';
import { click, getAllElementsBySelector, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('FyPolicyViolationInfoComponent', () => {
  let component: FyPolicyViolationInfoComponent;
  let fixture: ComponentFixture<FyPolicyViolationInfoComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    TestBed.configureTestingModule({
      declarations: [FyPolicyViolationInfoComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: ModalPropertiesService,
          useValue: modalPropertiesSpy,
        },
      ],
    }).compileComponents();
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;

    fixture = TestBed.createComponent(FyPolicyViolationInfoComponent);
    component = fixture.componentInstance;
    component.policyDetails = [individualExpPolicyStateData1];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show policy violation for a single violation', () => {
    expect(getTextContent(getElementBySelector(fixture, '.policy-violation-info--content'))).toEqual(
      'Policy violation found.'
    );
  });

  it('should open policy violation modal on clicking', () => {
    spyOn(component, 'openPolicyViolationDetails').and.returnValue(Promise.resolve(null));
    const viewDetailsButton = getElementBySelector(fixture, '.policy-violation-info--view-more') as HTMLElement;
    expect(getTextContent(viewDetailsButton)).toEqual('View details');
    click(viewDetailsButton);

    expect(component.openPolicyViolationDetails).toHaveBeenCalledTimes(1);
  });

  describe('openPolicyViolationDetails():', () => {
    it('should open critical policy violation details', async () => {
      component.criticalPolicyViolated = true;
      fixture.detectChanges();

      const properties = {
        cssClass: 'auto-height',
        showBackdrop: true,
        canDismiss: true,
        backdropDismiss: true,
        animated: true,
        initialBreakpoint: 1,
        breakpoints: [0, 1],
        handle: false,
      };

      modalController.create.and.returnValue(
        new Promise((resolve) => {
          const policyDetailsModalSpy = jasmine.createSpyObj('policyDetailsModal', ['present']) as any;
          resolve(policyDetailsModalSpy);
        })
      );

      modalProperties.getModalDefaultProperties.and.returnValue(properties);

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
        ...properties,
      });
    });

    it('should open policy violation details', async () => {
      component.criticalPolicyViolated = false;
      fixture.detectChanges();

      const properties = {
        cssClass: 'auto-height',
        showBackdrop: true,
        canDismiss: true,
        backdropDismiss: true,
        animated: true,
        initialBreakpoint: 1,
        breakpoints: [0, 1],
        handle: false,
      };

      modalController.create.and.returnValue(
        new Promise((resolve) => {
          const policyDetailsModalSpy = jasmine.createSpyObj('policyDetailsModal', ['present']) as any;
          resolve(policyDetailsModalSpy);
        })
      );

      modalProperties.getModalDefaultProperties.and.returnValue(properties);

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
        ...properties,
      });
    });
  });
});
