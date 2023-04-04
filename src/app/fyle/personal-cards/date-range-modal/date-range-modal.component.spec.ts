import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { DateRangeModalComponent } from './date-range-modal.component';
import { click, getElementBySelector } from 'src/app/core/dom-helpers';

describe('DateRangeModalComponent', () => {
  let component: DateRangeModalComponent;
  let fixture: ComponentFixture<DateRangeModalComponent>;
  let modalController: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    modalController = jasmine.createSpyObj('ModalController', ['dismiss']);
    TestBed.configureTestingModule({
      declarations: [DateRangeModalComponent],
      imports: [IonicModule.forRoot(), FormsModule, MatDatepickerModule, MatNativeDateModule],
      providers: [{ provide: ModalController, useValue: modalController }],
    }).compileComponents();

    fixture = TestBed.createComponent(DateRangeModalComponent);
    component = fixture.componentInstance;
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
    component.dateRangeStart.nativeElement.value = '2022-01-01';
    component.dateRangeEnd.nativeElement.value = '2022-01-15';
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
    expect(component.isCalenderVisible).toBe(true);
  });

  it('calenderClosed(): should set isCalenderVisible to false on calenderClosed', () => {
    fixture.detectChanges();
    component.calenderClosed();
    expect(component.isCalenderVisible).toBe(false);
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
