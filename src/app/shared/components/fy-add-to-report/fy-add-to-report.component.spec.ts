import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, PopoverController } from '@ionic/angular';

import { FyAddToReportComponent } from './fy-add-to-report.component';
import { Injector, NO_ERRORS_SCHEMA } from '@angular/core';
import { UntypedFormControl, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { ReportService } from 'src/app/core/services/report.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import {
  expectedErpt,
  expectedUnflattenedReports,
  unflattenedErptc,
  unflattenedErptcArrayItem1,
} from 'src/app/core/mock-data/report-unflattened.data';
import { properties } from 'src/app/core/mock-data/modal-properties.data';
import {
  addToReportModalControllerParams,
  popoverControllerParams,
  popoverControllerParams3,
} from 'src/app/core/mock-data/modal-controller.data';
import { reportOptionsData, reportOptionsData5 } from 'src/app/core/mock-data/report-options.data';
import { of } from 'rxjs';
import { reportUnflattenedData } from 'src/app/core/mock-data/report-v1.data';
import { cloneDeep } from 'lodash';

describe('FyAddToReportComponent', () => {
  let component: FyAddToReportComponent;
  let fixture: ComponentFixture<FyAddToReportComponent>;
  let reportService: jasmine.SpyObj<ReportService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let trackingService: jasmine.SpyObj<TrackingService>;

  beforeEach(waitForAsync(() => {
    const injectorSpy = jasmine.createSpyObj('Injector', ['get']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', [
      'getReportPurpose',
      'createDraft',
      'getFilteredPendingReports',
    ]);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'addToReportFromExpense',
      'createDraftReportFromExpense',
      'openCreateDraftReportPopover',
      'openAddToReportModal',
    ]);

    TestBed.configureTestingModule({
      declarations: [FyAddToReportComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: Injector,
          useValue: injectorSpy,
        },
        {
          provide: NgControl,
          useValue: {
            control: new UntypedFormControl(),
          },
        },
        {
          provide: ReportService,
          useValue: reportServiceSpy,
        },
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: ModalPropertiesService,
          useValue: modalPropertiesSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FyAddToReportComponent);
    component = fixture.componentInstance;
    fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('get valid():', () => {
    it('should return true if control is touched and valid', () => {
      //@ts-ignore
      component.ngControl.touched = true;
      //@ts-ignore
      component.ngControl.valid = true;
      expect(component.valid).toBeTrue();
    });

    it('should return false if control is touched and invalid', () => {
      //@ts-ignore
      component.ngControl.touched = true;
      //@ts-ignore
      component.ngControl.valid = false;
      expect(component.valid).toBeFalse();
    });

    it('should return true if control is untouched', () => {
      //@ts-ignore
      component.ngControl.touched = false;
      //@ts-ignore
      component.ngControl.valid = false;
      expect(component.valid).toBeTrue();
    });
  });

  it('get value(): should return innerValue', () => {
    //@ts-ignore
    component.innerValue = unflattenedErptc;
    expect(component.value).toEqual(unflattenedErptc);
  });

  it('set value(): should set innerValue provided and call setDisplayValue and onChangeCallback', () => {
    //@ts-ignore
    component.innerValue = unflattenedErptc;
    spyOn(component, 'setDisplayValue');
    //@ts-ignore
    spyOn(component, 'onChangeCallback');

    component.value = unflattenedErptcArrayItem1;
    //@ts-ignore
    expect(component.innerValue).toEqual(unflattenedErptcArrayItem1);
    expect(component.setDisplayValue).toHaveBeenCalledTimes(1);
    //@ts-ignore
    expect(component.onChangeCallback).toHaveBeenCalledOnceWith(unflattenedErptcArrayItem1);
  });

  it('ngOnChanges(): should set showNullOption to false and label equal to Expense report', () => {
    component.autoSubmissionReportName = 'test';
    component.ngOnChanges();
    expect(component.showNullOption).toBeFalse();
    expect(component.label).toEqual('Expense Report');
  });

  describe('openModal():', () => {
    beforeEach(() => {
      component.autoSubmissionReportName = '#Aug 1';
      component.options = reportOptionsData;
      component.value = expectedErpt[0];
      modalProperties.getModalDefaultProperties.and.returnValue(properties);
      reportService.getReportPurpose.and.returnValue(of('Client Meeting'));
      const draftReportPopoverSpy = jasmine.createSpyObj('draftReportPopover', ['present', 'onWillDismiss']);
      draftReportPopoverSpy.onWillDismiss.and.returnValue(
        Promise.resolve({
          data: {
            newValue: 'Client Meeting',
          },
        })
      );
      popoverController.create.and.resolveTo(draftReportPopoverSpy);
      const mockReportV1Data = cloneDeep(reportUnflattenedData);
      mockReportV1Data.id = 'rp72SaHM7Fbz';
      reportService.createDraft.and.returnValue(of(mockReportV1Data));
      reportService.getFilteredPendingReports.and.returnValue(of(expectedUnflattenedReports));
    });

    it('should set value equals to value returned by modalController and track addToReportFromExpense and openAddToReportModal event if createDraftReport is false', fakeAsync(() => {
      let selectionModalControllerSpy = jasmine.createSpyObj('selectionModal', ['present', 'onWillDismiss']);
      selectionModalControllerSpy.onWillDismiss.and.resolveTo({
        data: {
          createDraftReport: false,
          value: unflattenedErptcArrayItem1,
        },
      });
      modalController.create.and.resolveTo(selectionModalControllerSpy);
      component.openModal();
      tick(100);

      expect(modalController.create).toHaveBeenCalledOnceWith(addToReportModalControllerParams);
      expect(selectionModalControllerSpy.present).toHaveBeenCalledTimes(1);
      expect(selectionModalControllerSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
      expect(component.value).toEqual(unflattenedErptcArrayItem1);
      expect(trackingService.addToReportFromExpense).toHaveBeenCalledTimes(1);
      expect(trackingService.openAddToReportModal).toHaveBeenCalledTimes(1);
      expect(reportService.createDraft).not.toHaveBeenCalled();
      expect(trackingService.createDraftReportFromExpense).not.toHaveBeenCalled();
      expect(trackingService.openCreateDraftReportPopover).not.toHaveBeenCalled();
    }));

    it('should call popoverController and create a report as a draft', fakeAsync(() => {
      let selectionModalControllerSpy = jasmine.createSpyObj('selectionModal', ['present', 'onWillDismiss']);
      selectionModalControllerSpy.onWillDismiss.and.resolveTo({
        data: {
          createDraftReport: true,
          value: unflattenedErptcArrayItem1,
        },
      });
      modalController.create.and.resolveTo(selectionModalControllerSpy);
      component.openModal();
      tick(100);

      expect(modalController.create).toHaveBeenCalledOnceWith(addToReportModalControllerParams);
      expect(selectionModalControllerSpy.present).toHaveBeenCalledTimes(1);
      expect(selectionModalControllerSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
      expect(popoverController.create).toHaveBeenCalledOnceWith(popoverControllerParams3);
      expect(reportService.getReportPurpose).toHaveBeenCalledOnceWith({ ids: null });
      expect(reportService.getFilteredPendingReports).toHaveBeenCalledOnceWith({ state: 'edit' });
      expect(reportService.createDraft).toHaveBeenCalledOnceWith({
        purpose: 'Client Meeting',
        source: 'MOBILE',
      });
      expect(component.value).toEqual(expectedUnflattenedReports[1]);
      expect(component.options).toEqual(reportOptionsData5);
      expect(trackingService.openAddToReportModal).toHaveBeenCalledTimes(1);
      expect(trackingService.createDraftReportFromExpense).toHaveBeenCalledTimes(1);
      expect(trackingService.openCreateDraftReportPopover).toHaveBeenCalledTimes(1);
      expect(trackingService.openAddToReportModal).toHaveBeenCalledTimes(1);
      expect(trackingService.addToReportFromExpense).not.toHaveBeenCalled();
    }));

    it('should set value to undefined if createDraftReport is true and none of the filtered reports id matches with newly created report id', fakeAsync(() => {
      reportService.createDraft.and.returnValue(of(reportUnflattenedData));
      let selectionModalControllerSpy = jasmine.createSpyObj('selectionModal', ['present', 'onWillDismiss']);
      selectionModalControllerSpy.onWillDismiss.and.resolveTo({
        data: {
          createDraftReport: true,
          value: unflattenedErptcArrayItem1,
        },
      });
      modalController.create.and.resolveTo(selectionModalControllerSpy);
      component.openModal();
      tick(100);

      expect(component.value).toEqual(undefined);
    }));
  });

  it('onBlur(): should call onTouchedCallback', () => {
    //@ts-ignore
    spyOn(component, 'onTouchedCallback');
    component.onBlur();
    //@ts-ignore
    expect(component.onTouchedCallback).toHaveBeenCalledTimes(1);
  });

  it('writeValue(): should set innerValue and call setDisplayValue', () => {
    //@ts-ignore
    spyOn(component, 'setDisplayValue');
    component.writeValue(unflattenedErptc);
    //@ts-ignore
    expect(component.innerValue).toEqual(unflattenedErptc);
    expect(component.setDisplayValue).toHaveBeenCalledTimes(1);
  });

  describe('setDisplayValue():', () => {
    it('should set displayValue equals to the option label which matches with innerValue', () => {
      //@ts-ignore
      component.options = reportOptionsData;
      //@ts-ignore
      component.innerValue = expectedErpt[0];
      component.setDisplayValue();
      expect(component.displayValue).toEqual('report1');
    });

    it('should set displayValue equals to innerValue if innerValue is of type string', () => {
      //@ts-ignore
      component.innerValue = 'test';
      component.setDisplayValue();
      expect(component.displayValue).toEqual('test');
    });

    it('should set displayValue equals to autoSubmissionReportName if none of the options matches with innerValue', () => {
      component.autoSubmissionReportName = '#Aug 1';
      //@ts-ignore
      component.innerValue = unflattenedErptc;
      component.setDisplayValue();
      expect(component.displayValue).toEqual('#Aug 1');
    });

    it('should set displayValue equals to empty string if none of the options matches with innerValue and autoSubmissionReportName is undefined', () => {
      component.autoSubmissionReportName = undefined;
      //@ts-ignore
      component.innerValue = unflattenedErptc;
      component.setDisplayValue();
      expect(component.displayValue).toEqual('');
    });
  });

  it('registerOnChange(): should set onChangeCallback', () => {
    //@ts-ignore
    component.onChangeCallback = undefined;
    const mockCallback = (unflattenedErptc) => {};
    //@ts-ignore
    component.registerOnChange(mockCallback);
    //@ts-ignore
    expect(component.onChangeCallback).toEqual(mockCallback);
  });

  it('registerOnTouched(): should set onTouchedCallback', () => {
    //@ts-ignore
    component.onTouchedCallback = undefined;
    const mockCallback = () => {};
    //@ts-ignore
    component.registerOnTouched(mockCallback);
    //@ts-ignore
    expect(component.onTouchedCallback).toEqual(mockCallback);
  });
});
