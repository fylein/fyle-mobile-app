import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, PopoverController } from '@ionic/angular';

import { FyAddToReportComponent } from './fy-add-to-report.component';
import { Injector, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { ReportService } from 'src/app/core/services/report.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { unflattenedErptc, unflattenedErptcArrayItem1 } from 'src/app/core/mock-data/report-unflattened.data';

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
            control: new FormControl(),
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
});
