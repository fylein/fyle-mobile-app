import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ReportsCardComponent } from './reports-card.component';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatIconModule } from '@angular/material/icon';
import { EllipsisPipe } from '../../pipes/ellipses.pipe';
import { HumanizeCurrencyPipe } from '../../pipes/humanize-currency.pipe';
import { ExactCurrencyPipe } from '../../pipes/exact-currency.pipe';
import { FyCurrencyPipe } from '../../pipes/fy-currency.pipe';
import { CurrencyPipe } from '@angular/common';
import { ReportState } from '../../pipes/report-state.pipe';
import { SnakeCaseToSpaceCase } from '../../pipes/snake-case-to-space-case.pipe';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { expectedReportsSinglePage } from 'src/app/core/mock-data/platform-report.data';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';
describe('ReportsCardComponent', () => {
  let component: ReportsCardComponent;
  let fixture: ComponentFixture<ReportsCardComponent>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [
        MatIconTestingModule,
        MatIconModule,
        TranslocoModule,
        ReportsCardComponent,
        EllipsisPipe,
        HumanizeCurrencyPipe,
        ExactCurrencyPipe,
        ReportState,
        SnakeCaseToSpaceCase,
      ],
      providers: [FyCurrencyPipe, CurrencyPipe, { provide: TranslocoService, useValue: translocoServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsCardComponent);
    component = fixture.componentInstance;
    component.report = expectedReportsSinglePage[0];
    component.prevDate = new Date();
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'reportsCard.expense': 'Expense',
        'reportsCard.expenses': 'Expenses',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display information correctly', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(getTextContent(getElementBySelector(fixture, '.reports-card--date'))).toEqual('Jul 11, 2023');
    expect(getTextContent(getElementBySelector(fixture, '.reports-card--purpose'))).toEqual('#8:  Jan 2023');
    expect(getTextContent(getElementBySelector(fixture, '.reports-card--amount-block'))).toContain('$100.00');
    expect(getTextContent(getElementBySelector(fixture, '.reports-card--no-transactions'))).toEqual('0 Expenses');
  }));

  it('onGoToReport(): should emit go to report', () => {
    const goToReportSpy = spyOn(component.gotoReport, 'emit');

    component.onGoToReport();
    expect(goToReportSpy).toHaveBeenCalledTimes(1);
  });

  it('onViewComments(): should emit view comments', () => {
    const viewCommentsSpy = spyOn(component.viewComments, 'emit');

    component.onViewComments();
    expect(viewCommentsSpy).toHaveBeenCalledTimes(1);
  });

  it('should go to report if clicked on', () => {
    spyOn(component, 'onGoToReport');

    const reportCard = getElementBySelector(fixture, '.reports-card') as HTMLElement;
    click(reportCard);
    expect(component.onGoToReport).toHaveBeenCalledTimes(1);
  });
});
