import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ControlValueAccessor, FormsModule, NgControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IonicModule, ModalController } from '@ionic/angular';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { FySelectProjectComponent } from './fy-select-project.component';

describe('FySelectProjectComponent', () => {
  let component: FySelectProjectComponent;
  let fixture: ComponentFixture<FySelectProjectComponent>;
  let el: DebugElement;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalPropertiesService: jasmine.SpyObj<ModalPropertiesService>;

  beforeEach(
    waitForAsync(() => {
      const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
      const modalPropertiesServiceSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);

      TestBed.configureTestingModule({
        declarations: [FySelectProjectComponent],
        imports: [IonicModule.forRoot(), FormsModule, ReactiveFormsModule],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {
            provide: ModalController,
            useValue: modalControllerSpy,
          },
          {
            provide: ModalPropertiesService,
            useValue: modalPropertiesServiceSpy,
          },
        ],
      }).compileComponents();

      modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
      modalPropertiesService = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;

      fixture = TestBed.createComponent(FySelectProjectComponent);
      fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);
      component = fixture.componentInstance;
      el = fixture.debugElement;
      component.ngOnInit();
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be able to display proper label', () => {
    component.label = 'Project Field';
    fixture.detectChanges();
    const label = el.query(By.css('.fy-select-project--label-content'));
    expect(label.nativeElement.textContent.trim()).toEqual('Project Field');
  });

  it('should be able to set a proper project value', async () => {
    const project = {
      ap1_email: null,
      ap1_full_name: null,
      ap2_email: null,
      ap2_full_name: null,
      project_active: true,
      project_approver1_id: null,
      project_approver2_id: null,
      project_code: '1184',
      project_created_at: new Date('2021-05-12T10:28:40.834844'),
      project_description: 'Sage Intacct Project - Customer Mapped Project, Id - 1184',
      project_id: 257528,
      project_name: 'Customer Mapped Project',
      project_org_category_ids: [122269, 122270, 122271, null],
      project_org_id: 'orFdTTTNcyye',
      project_updated_at: new Date('2021-07-08T10:28:27.686886'),
      projectv2_name: 'Customer Mapped Project',
      sub_project_name: null,
    };

    component.writeValue(project);
    fixture.detectChanges();
    await fixture.whenStable();

    const inputDisplayField = el.query(By.css('.fy-select-project--input'));
    expect(inputDisplayField.nativeElement.value).toEqual('Customer Mapped Project');
  });

  it('should be able to set a empty project ', async () => {
    component.writeValue(null);
    fixture.detectChanges();
    await fixture.whenStable();

    const inputDisplayField = el.query(By.css('.fy-select-project--input'));
    expect(inputDisplayField.nativeElement.value).toEqual('');
  });

  it('should be able to set touched value properly whenever the input field is touched', () => {
    const callBackTestObject = jasmine.createSpyObj('touchedTested', ['touchedTested']);
    component.registerOnTouched(callBackTestObject.touchedTested);

    expect(callBackTestObject.touchedTested).not.toHaveBeenCalled();

    const inputDisplayField = el.query(By.css('.fy-select-project--input'));
    inputDisplayField.triggerEventHandler('blur', null);

    fixture.detectChanges();

    expect(callBackTestObject.touchedTested).toHaveBeenCalled();
  });

  it('should be able to trigger on change value properly & set display value whenever the input field is changed', async () => {
    const sampleProject = {
      ap1_email: null,
      ap1_full_name: null,
      ap2_email: null,
      ap2_full_name: null,
      project_active: true,
      project_approver1_id: null,
      project_approver2_id: null,
      project_code: '1184',
      project_created_at: new Date('2021-05-12T10:28:40.834844'),
      project_description: 'Sage Intacct Project - Customer Mapped Project, Id - 1184',
      project_id: 257528,
      project_name: 'Customer Mapped Project',
      project_org_category_ids: [122269, 122270, 122271, null],
      project_org_id: 'orFdTTTNcyye',
      project_updated_at: new Date('2021-07-08T10:28:27.686886'),
      projectv2_name: 'Customer Mapped Project',
      sub_project_name: null,
    };

    const changeTestCallback = jasmine.createSpyObj('changeTested', ['test']);
    component.registerOnChange(changeTestCallback.test);

    expect(changeTestCallback.test).not.toHaveBeenCalled();

    const modalControllerMockReturnValue = Promise.resolve({
      present: () => Promise.resolve({}),
      onWillDismiss: () =>
        Promise.resolve({
          data: {
            value: sampleProject,
          },
        }),
    });

    modalController.create.and.returnValue(modalControllerMockReturnValue as any); // there are too many methods to mock
    modalPropertiesService.getModalDefaultProperties.and.returnValue({
      cssClass: 'fy-modal',
      showBackdrop: true,
      canDismiss: true,
      backdropDismiss: true,
      animated: true,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: false,
    });

    await component.openModal();

    fixture.detectChanges();
    await fixture.whenStable();

    expect(changeTestCallback.test).toHaveBeenCalled();
    const inputDisplayField = el.query(By.css('.fy-select-project--input'));
    expect(inputDisplayField.nativeElement.value).toEqual('Customer Mapped Project');
  });

  it('should be able to set a project to null after it has been set to a value', async () => {
    const sampleProject = {
      ap1_email: null,
      ap1_full_name: null,
      ap2_email: null,
      ap2_full_name: null,
      project_active: true,
      project_approver1_id: null,
      project_approver2_id: null,
      project_code: '1184',
      project_created_at: new Date('2021-05-12T10:28:40.834844'),
      project_description: 'Sage Intacct Project - Customer Mapped Project, Id - 1184',
      project_id: 257528,
      project_name: 'Customer Mapped Project',
      project_org_category_ids: [122269, 122270, 122271, null],
      project_org_id: 'orFdTTTNcyye',
      project_updated_at: new Date('2021-07-08T10:28:27.686886'),
      projectv2_name: 'Customer Mapped Project',
      sub_project_name: null,
    };

    const changeTestCallback = jasmine.createSpyObj('changeTested', ['test']);
    component.registerOnChange(changeTestCallback.test);

    expect(changeTestCallback.test).not.toHaveBeenCalled();

    const modalControllerMockReturnValue = Promise.resolve({
      present: () => Promise.resolve({}),
      onWillDismiss: () =>
        Promise.resolve({
          data: {
            value: sampleProject,
          },
        }),
    });

    modalController.create.and.returnValue(modalControllerMockReturnValue as any); // there are too many methods to mock
    modalPropertiesService.getModalDefaultProperties.and.returnValue({
      cssClass: 'fy-modal',
      showBackdrop: true,
      canDismiss: true,
      backdropDismiss: true,
      animated: true,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: false,
    });

    await component.openModal();

    fixture.detectChanges();
    await fixture.whenStable();

    expect(changeTestCallback.test).toHaveBeenCalled();
    const inputDisplayField = el.query(By.css('.fy-select-project--input'));
    expect(inputDisplayField.nativeElement.value).toEqual('Customer Mapped Project');

    const modalControllerMockReturnValue2 = Promise.resolve({
      present: () => Promise.resolve({}),
      onWillDismiss: () =>
        Promise.resolve({
          data: {
            value: null,
          },
        }),
    });

    modalController.create.and.returnValue(modalControllerMockReturnValue2 as any); // there are too many methods to mock

    await component.openModal();

    fixture.detectChanges();
    await fixture.whenStable();

    expect(changeTestCallback.test).toHaveBeenCalled();
    const inputDisplayField2 = el.query(By.css('.fy-select-project--input'));
    expect(inputDisplayField2.nativeElement.value).toEqual('');
  });

  it('should not show validation message till the input is touched', async () => {
    component.mandatory = true;
    fixture.detectChanges();
    await fixture.whenStable();

    const validationMessage = el.query(By.css('.fy-select-project--input-invalid'));
    expect(validationMessage).toBeNull();
    expect(component.valid).toBe(true);

    component.validInParent = false;
    component.touchedInParent = true;

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.valid).toBe(false);
  });
});
