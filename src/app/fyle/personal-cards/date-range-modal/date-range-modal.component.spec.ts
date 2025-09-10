import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { DateRangeModalComponent } from './date-range-modal.component';
import { click, getElementBySelector } from 'src/app/core/dom-helpers';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('DateRangeModalComponent', () => {
  let component: DateRangeModalComponent;
  let fixture: ComponentFixture<DateRangeModalComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    modalController = jasmine.createSpyObj('ModalController', ['dismiss']);
    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        TranslocoModule,
        DateRangeModalComponent,
      ],
      providers: [
        { provide: ModalController, useValue: modalController },
        { provide: TranslocoService, useValue: translocoServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DateRangeModalComponent);
    component = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'dateRangeModal.dateRange': 'Date range',
        'dateRangeModal.thisMonth': 'This month',
        'dateRangeModal.lastMonth': 'Last month',
        'dateRangeModal.last30Days': 'Last 30 days',
        'dateRangeModal.last60Days': 'Last 60 days',
        'dateRangeModal.allTime': 'All time',
        'dateRangeModal.customRange': 'Custom range',
        'dateRangeModal.startDate': 'Start date',
        'dateRangeModal.endDate': 'End date',
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

  it('selectRange(): should dismiss the modal with correct range value', () => {
    const range = 'This Month';
    component.selectRange(range);
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({ range });
  });

  it('should dismiss modal when selecting a pre-defined range', () => {
    const button = getElementBySelector(fixture, '.date-range-modal--label') as HTMLElement;
    click(button);
    fixture.detectChanges();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('should dismiss the modal with custom range dates', () => {
    component.dateRangeStart().nativeElement.value = '2022-01-01';
    component.dateRangeEnd().nativeElement.value = '2022-01-15';
    fixture.detectChanges();
    component.datePicked();
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({
      range: 'Custom Range',
      startDate: '2022-01-01',
      endDate: '2022-01-15',
    });
  });

  it('calenderOpened() should set isCalenderVisible to true on calenderOpened', () => {
    fixture.detectChanges();
    component.calenderOpened();
    expect(component.isCalenderVisible).toBeTrue();
  });

  it('calenderClosed(): should set isCalenderVisible to false on calenderClosed', () => {
    fixture.detectChanges();
    component.calenderClosed();
    expect(component.isCalenderVisible).toBeFalse();
  });

  it('should set isCalenderVisible to true when the date range picker is opened', () => {
    component.isCalenderVisible = false;
    const dateRangePickerEl = getElementBySelector(fixture, 'mat-date-range-picker');
    fixture.detectChanges();
    dateRangePickerEl.dispatchEvent(new Event('opened'));
    expect(component.isCalenderVisible).toBeTrue();
  });

  it('should set isCalenderVisible to false when the date range picker is closed', () => {
    component.isCalenderVisible = true;
    const dateRangePickerEl = getElementBySelector(fixture, 'mat-date-range-picker');
    fixture.detectChanges();
    dateRangePickerEl.dispatchEvent(new Event('closed'));
    expect(component.isCalenderVisible).toBeFalse();
  });
});
