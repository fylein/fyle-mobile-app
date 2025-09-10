import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { ModalController, PopoverController } from '@ionic/angular/standalone';

import { FyAddToReportComponent } from './fy-add-to-report.component';
import { Injector, NO_ERRORS_SCHEMA } from '@angular/core';
import { UntypedFormControl, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { expectedReportsPaginated } from 'src/app/core/mock-data/platform-report.data';
import { properties } from 'src/app/core/mock-data/modal-properties.data';
import {
  addToReportModalControllerParams,
  popoverControllerParams,
  popoverControllerParams3,
} from 'src/app/core/mock-data/modal-controller.data';
import { reportOptionsData, reportOptionsData3 } from 'src/app/core/mock-data/report-options.data';
import { of } from 'rxjs';
import { cloneDeep } from 'lodash';

describe('FyAddToReportComponent', () => {
  let component: FyAddToReportComponent;
  let fixture: ComponentFixture<FyAddToReportComponent>;
  let platformSpenderReportsService: jasmine.SpyObj<SpenderReportsService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const injectorSpy = jasmine.createSpyObj('Injector', ['get']);
    const platformSpenderReportsServiceSpy = jasmine.createSpyObj('SpenderReportsService', [
      'getAllReportsByParams',
      'getReportsCount',
      'getReportsByParams',
      'createDraft',
      'suggestPurpose',
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
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [ TranslocoModule, FyAddToReportComponent],
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
          provide: SpenderReportsService,
          useValue: platformSpenderReportsServiceSpy,
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
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FyAddToReportComponent);
    component = fixture.componentInstance;
    fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);
    platformSpenderReportsService = TestBed.inject(SpenderReportsService) as jasmine.SpyObj<SpenderReportsService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyAddToReport.expenseReport': 'Expense Report',
        'fyAddToReport.all': 'All',
        'fyAddToReport.newDraftReport': 'New Draft Report',
        'fyAddToReport.save': 'Save',
        'fyAddToReport.reportName': 'Report Name',
        'fyAddToReport.selectExpenseReport': 'Select a expense report',
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
    component.innerValue = expectedReportsPaginated[0];
    expect(component.value).toEqual(expectedReportsPaginated[0]);
  });

  it('set value(): should set innerValue provided and call setDisplayValue and onChangeCallback', () => {
    //@ts-ignore
    component.innerValue = expectedReportsPaginated[1];
    spyOn(component, 'setDisplayValue');
    //@ts-ignore
    spyOn(component, 'onChangeCallback');
    component.value = expectedReportsPaginated[0];
    //@ts-ignore
    expect(component.innerValue).toEqual(expectedReportsPaginated[0]);
    expect(component.setDisplayValue).toHaveBeenCalledTimes(1);
    //@ts-ignore
    expect(component.onChangeCallback).toHaveBeenCalledOnceWith(expectedReportsPaginated[0]);
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
      component.value = expectedReportsPaginated[0];
      modalProperties.getModalDefaultProperties.and.returnValue(properties);
      platformSpenderReportsService.suggestPurpose.and.returnValue(of('Client Meeting'));
      const draftReportPopoverSpy = jasmine.createSpyObj('draftReportPopover', ['present', 'onWillDismiss']);
      draftReportPopoverSpy.onWillDismiss.and.resolveTo({
        data: {
          newValue: 'Client Meeting',
        },
      });
      popoverController.create.and.resolveTo(draftReportPopoverSpy);
      // const mockReportData = cloneDeep(expectedReportsPaginated[1]);
      // mockReportData.id = 'rp72SaHM7Fbz';
      platformSpenderReportsService.createDraft.and.returnValue(of(expectedReportsPaginated[0]));
      platformSpenderReportsService.getAllReportsByParams.and.returnValue(of(expectedReportsPaginated));
    });

    it('should set value equals to value returned by modalController and track addToReportFromExpense and openAddToReportModal event if createDraftReport is false', fakeAsync(() => {
      const selectionModalControllerSpy = jasmine.createSpyObj('selectionModal', ['present', 'onWillDismiss']);
      selectionModalControllerSpy.onWillDismiss.and.resolveTo({
        data: {
          createDraftReport: false,
          value: expectedReportsPaginated[0],
        },
      });
      modalController.create.and.resolveTo(selectionModalControllerSpy);
      component.openModal();
      tick(100);

      expect(modalController.create).toHaveBeenCalledOnceWith(addToReportModalControllerParams);
      expect(selectionModalControllerSpy.present).toHaveBeenCalledTimes(1);
      expect(selectionModalControllerSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
      expect(component.value).toEqual(expectedReportsPaginated[0]);
      expect(trackingService.addToReportFromExpense).toHaveBeenCalledTimes(1);
      expect(trackingService.openAddToReportModal).toHaveBeenCalledTimes(1);
      expect(platformSpenderReportsService.createDraft).not.toHaveBeenCalled();
      expect(trackingService.createDraftReportFromExpense).not.toHaveBeenCalled();
      expect(trackingService.openCreateDraftReportPopover).not.toHaveBeenCalled();
    }));

    it('should call popoverController and create a report as a draft', fakeAsync(() => {
      const selectionModalControllerSpy = jasmine.createSpyObj('selectionModal', ['present', 'onWillDismiss']);
      selectionModalControllerSpy.onWillDismiss.and.resolveTo({
        data: {
          createDraftReport: true,
          value: expectedReportsPaginated[0],
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
      expect(platformSpenderReportsService.suggestPurpose).toHaveBeenCalledOnceWith([]);
      expect(platformSpenderReportsService.getAllReportsByParams).toHaveBeenCalledOnceWith({
        state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
      });
      expect(platformSpenderReportsService.createDraft).toHaveBeenCalledOnceWith({
        data: {
          purpose: 'Client Meeting',
          source: 'MOBILE',
        },
      });
      expect(component.value).toEqual(expectedReportsPaginated[0]);
      expect(component.options).toEqual(reportOptionsData3);
      expect(trackingService.openAddToReportModal).toHaveBeenCalledTimes(1);
      expect(trackingService.createDraftReportFromExpense).toHaveBeenCalledTimes(1);
      expect(trackingService.openCreateDraftReportPopover).toHaveBeenCalledTimes(1);
      expect(trackingService.openAddToReportModal).toHaveBeenCalledTimes(1);
      expect(trackingService.addToReportFromExpense).not.toHaveBeenCalled();
    }));

    it('should set value to undefined if createDraftReport is true and none of the filtered reports id matches with newly created report id', fakeAsync(() => {
      const mockReportData = cloneDeep(expectedReportsPaginated[1]);
      mockReportData.id = 'rp72SaHM7Fbz';
      platformSpenderReportsService.createDraft.and.returnValue(of(mockReportData));
      const selectionModalControllerSpy = jasmine.createSpyObj('selectionModal', ['present', 'onWillDismiss']);
      selectionModalControllerSpy.onWillDismiss.and.resolveTo({
        data: {
          createDraftReport: true,
          value: expectedReportsPaginated[0],
        },
      });
      modalController.create.and.resolveTo(selectionModalControllerSpy);
      component.openModal();
      tick(100);

      expect(component.value).toBeUndefined();
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
    component.writeValue(expectedReportsPaginated[0]);
    //@ts-ignore
    expect(component.innerValue).toEqual(expectedReportsPaginated[0]);
    expect(component.setDisplayValue).toHaveBeenCalledTimes(1);
  });

  describe('setDisplayValue():', () => {
    it('should set displayValue equals to the option label which matches with innerValue', () => {
      //@ts-ignore
      component.options = reportOptionsData;
      //@ts-ignore
      component.innerValue = expectedReportsPaginated[0];
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
      component.innerValue = expectedReportsPaginated[0];
      component.setDisplayValue();
      expect(component.displayValue).toEqual('#Aug 1');
    });

    it('should set displayValue equals to empty string if none of the options matches with innerValue and autoSubmissionReportName is undefined', () => {
      component.autoSubmissionReportName = undefined;
      //@ts-ignore
      component.innerValue = expectedReportsPaginated[0];
      component.setDisplayValue();
      expect(component.displayValue).toEqual('');
    });
  });

  it('registerOnChange(): should set onChangeCallback', () => {
    //@ts-ignore
    component.onChangeCallback = undefined;
    const mockCallback = (expectedReportsPaginated) => {};
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
