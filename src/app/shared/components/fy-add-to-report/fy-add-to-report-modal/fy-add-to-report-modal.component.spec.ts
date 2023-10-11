import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { FyAddToReportModalComponent } from './fy-add-to-report-modal.component';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import { optionData1 } from 'src/app/core/mock-data/option.data';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { ReportState } from 'src/app/shared/pipes/report-state.pipe';
import { SnakeCaseToSpaceCase } from 'src/app/shared/pipes/snake-case-to-space-case.pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { click, getAllElementsBySelector, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

describe('FyAddToReportModalComponent', () => {
  let component: FyAddToReportModalComponent;
  let fixture: ComponentFixture<FyAddToReportModalComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const cdrSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    TestBed.configureTestingModule({
      declarations: [FyAddToReportModalComponent, HumanizeCurrencyPipe, ReportState, SnakeCaseToSpaceCase],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule],
      providers: [
        FyCurrencyPipe,
        CurrencyPipe,
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: ChangeDetectorRef,
          useValue: cdrSpy,
        },
        {
          provide: CurrencyService,
          useValue: currencyServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FyAddToReportModalComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    cdr = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    component.currentSelection = optionData1[0].value;
    component.options = optionData1;
    currencyService.getHomeCurrency.and.returnValue(of('USD'));
    fixture.detectChanges();
  }));
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onDoneClick(): should call done CTA', () => {
    modalController.dismiss.and.returnValue(Promise.resolve(true));

    component.onDoneClick();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('onElementSelect(): should select element', () => {
    modalController.dismiss.and.returnValue(Promise.resolve(true));

    component.onElementSelect(component.options[0]);
    expect(modalController.dismiss).toHaveBeenCalledOnceWith(component.options[0]);
  });

  it('createDraftReport(): should create a draft report', () => {
    modalController.dismiss.and.returnValue(Promise.resolve(true));

    component.createDraftReport();
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({ createDraftReport: true });
  });

  it('dismissModal(): should dismiss the modal', () => {
    modalController.dismiss.and.returnValue(Promise.resolve(true));

    component.dismissModal({ srcElement: { innerText: 'Hello' } });
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({
      label: 'Hello',
      value: null,
    });
  });

  it('should show auto submission report if provided', () => {
    component.autoSubmissionReportName = 'Report 1';
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '[data-testid="auto_submit_report"]'))).toEqual('Report 1');
  });

  it('display zero state if no report found', () => {
    component.options = [];
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.report-list--zero-state__title'))).toEqual(
      'No Reports found',
    );
    expect(getTextContent(getElementBySelector(fixture, '.report-list--zero-state__subtitle'))).toEqual(
      'To create a draft report please click on',
    );
  });

  it('should go to create draft report if add icon is clicked', () => {
    spyOn(component, 'createDraftReport');

    const addIcon = getElementBySelector(fixture, '.report-list--add-icon') as HTMLElement;
    click(addIcon);

    expect(component.createDraftReport).toHaveBeenCalledTimes(1);
  });

  it('should close the modal on clicking the done CTA', () => {
    spyOn(component, 'onDoneClick');

    const closeIcon = getElementBySelector(fixture, '[data-testid="close_icon"]') as HTMLElement;
    click(closeIcon);
    expect(component.onDoneClick).toHaveBeenCalledTimes(1);
  });

  it('should select the report when click on it', () => {
    spyOn(component, 'onElementSelect');

    const reportCards = getAllElementsBySelector(fixture, '[data-testid="reports"]');
    const clickCard = reportCards[0] as HTMLElement;
    click(clickCard);

    expect(component.onElementSelect).toHaveBeenCalledOnceWith(optionData1[0]);
  });

  it('should dismiss modal', () => {
    spyOn(component, 'dismissModal');
    component.autoSubmissionReportName = 'Report 1';
    fixture.detectChanges();

    const autoSubmissionReport = getElementBySelector(fixture, '.report-list--default-container') as HTMLElement;
    click(autoSubmissionReport);
    expect(component.dismissModal).toHaveBeenCalledTimes(1);
  });

  it('should report information correctly', () => {
    const reportCards = getAllElementsBySelector(fixture, '[data-testid="reports"]');

    expect(getTextContent(reportCards[0].getElementsByClassName('report-list--purpose')[0])).toEqual(
      optionData1[0].value.rp.purpose,
    );

    expect(getTextContent(reportCards[0].getElementsByClassName('report-list--count')[0])).toEqual(
      `${optionData1[0].value.rp.num_transactions} Expense${optionData1[0].value.rp.num_transactions > 1 ? 's' : ''}`,
    );

    expect(getTextContent(reportCards[0].getElementsByClassName('report-list--currency')[0])).toEqual('$');
    expect(getTextContent(reportCards[0].getElementsByClassName('report-list--amount')[0])).toEqual('1.35K');
  });
});
