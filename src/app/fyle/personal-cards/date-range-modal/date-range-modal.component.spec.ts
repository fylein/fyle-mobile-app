import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { DateRangeModalComponent } from './date-range-modal.component';

fdescribe('DateRangeModalComponent', () => {
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

  it('selectRange(): should call modalController.dismiss with correct range value', () => {
    const range = 'This Month';
    component.selectRange(range);
    expect(modalController.dismiss).toHaveBeenCalledWith({ range });
  });

  it('should dismiss modal when selecting a pre-defined range', () => {
    const button = fixture.nativeElement.querySelector('.date-range-modal--label');
    button.click();
    fixture.detectChanges();
    expect(modalController.dismiss).toHaveBeenCalled();
  });

  it('should dismiss modal when selecting a custom range', () => {
    const startDateInput = fixture.nativeElement.querySelector('input[placeholder="Start date"]');
    startDateInput.value = '2022-01-01';
    startDateInput.dispatchEvent(new Event('input'));
    const endDateInput = fixture.nativeElement.querySelector('input[placeholder="End date"]');
    endDateInput.value = '2022-01-31';
    endDateInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.mat-calendar-body-cell');
    button.click();
    fixture.detectChanges();
    expect(modalController.dismiss).toHaveBeenCalled();
  });
});
