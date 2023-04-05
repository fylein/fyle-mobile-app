import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { TasksCardComponent } from './tasks-card.component';
import { IonicModule } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatRippleModule } from '@angular/material/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { TaskIcon } from 'src/app/core/models/task-icon.enum';
import { TASKEVENT } from 'src/app/core/models/task-event.enum';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

describe('TasksCardComponent', () => {
  let component: TasksCardComponent;
  let fixture: ComponentFixture<TasksCardComponent>;
  let currencyService: jasmine.SpyObj<CurrencyService>;

  beforeEach(waitForAsync(() => {
    currencyService = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    currencyService.getHomeCurrency.and.returnValue(of('INR'));
    TestBed.configureTestingModule({
      declarations: [TasksCardComponent],
      imports: [IonicModule.forRoot(), MatRippleModule, MatIconModule, MatIconTestingModule, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksCardComponent);
    component = fixture.componentInstance;
    component.currencySymbol$ = of('₹');
    component.task = {
      amount: '142.26K',
      count: 13,
      header: 'Unreported',
      subheader: '13 expenses  worth ₹142.26K  can be added to a report',
      icon: TaskIcon.REPORT,
      ctas: [
        {
          content: 'Add to Report',
          event: TASKEVENT.expensesAddToReport,
        },
      ],
    };
    component.autoSubmissionReportDate = new Date('Tue Apr 04 2023 00:00:00 GMT+0530');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('taskCtaClicked(): should emit ctaClicked event on taskCtaClicked', () => {
    const ctaClickedSpy = spyOn(component.ctaClicked, 'emit');
    component.taskCtaClicked(component.task);
    expect(ctaClickedSpy).toHaveBeenCalledOnceWith(component.task.ctas[0]);
  });

  it('onInfoCardClicked(): should emit infoCardClicked event on onInfoCardClicked', () => {
    const infoCardClickedSpy = spyOn(component.infoCardClicked, 'emit');
    component.onInfoCardClicked();
    expect(infoCardClickedSpy).toHaveBeenCalledTimes(1);
  });

  it('should set showReportAutoSubmissionInfo to true when task header includes "Incomplete expense" and autoSubmissionReportDate is truthy', () => {
    component.task.header = 'Incomplete expense';
    component.autoSubmissionReportDate = new Date('Tue Apr 04 2023 00:00:00 GMT+0530');
    component.ngOnInit();
    expect(component.showReportAutoSubmissionInfo).toBeTrue();
  });

  it('should set homeCurrency$ and currencySymbol$ on ngOnInit', fakeAsync(() => {
    currencyService.getHomeCurrency.and.returnValue(of('INR'));
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.homeCurrency$).toBeDefined();
    component.homeCurrency$.subscribe((homeCurrency: string) => {
      expect(homeCurrency).toBe('INR');
    });

    expect(component.currencySymbol$).toBeDefined();
    component.currencySymbol$.subscribe((currencySymbol: string) => {
      expect(currencySymbol).toBe('₹');
    });
    tick();
  }));

  it('should display the correct header and subheader for the first task', () => {
    const taskHeader = getElementBySelector(fixture, '.task--header');
    expect(getTextContent(taskHeader)).toContain('Unreported');

    const taskSubheader = getElementBySelector(fixture, '.task--subheader');
    expect(getTextContent(taskSubheader)).toContain('13 expenses  worth ₹142.26K  can be added to a report');
  });
});
