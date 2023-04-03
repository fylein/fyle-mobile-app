import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ReportsCardComponent } from './reports-card.component';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatIconModule } from '@angular/material/icon';
import { apiExtendedReportRes } from 'src/app/core/mock-data/report.data';
import { EllipsisPipe } from '../../pipes/ellipses.pipe';
import { HumanizeCurrencyPipe } from '../../pipes/humanize-currency.pipe';
import { FyCurrencyPipe } from '../../pipes/fy-currency.pipe';
import { CurrencyPipe } from '@angular/common';
import { ReportState } from '../../pipes/report-state.pipe';
import { SnakeCaseToSpaceCase } from '../../pipes/snake-case-to-space-case.pipe';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

describe('ReportsCardComponent', () => {
  let component: ReportsCardComponent;
  let fixture: ComponentFixture<ReportsCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ReportsCardComponent, EllipsisPipe, HumanizeCurrencyPipe, ReportState, SnakeCaseToSpaceCase],
      imports: [IonicModule.forRoot(), MatIconTestingModule, MatIconModule],
      providers: [FyCurrencyPipe, CurrencyPipe],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsCardComponent);
    component = fixture.componentInstance;
    component.erpt = apiExtendedReportRes[0];
    component.prevDate = new Date();
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display information correctly', () => {
    expect(getTextContent(getElementBySelector(fixture, '.reports-card--date'))).toEqual('Jan 21, 2023');
    expect(getTextContent(getElementBySelector(fixture, '.reports-card--purpose'))).toEqual('#8:  Jan 2023');
    expect(getTextContent(getElementBySelector(fixture, '.reports-card--currency'))).toEqual('$');
    expect(getTextContent(getElementBySelector(fixture, '.reports-card--amount'))).toEqual('116.90');
    expect(getTextContent(getElementBySelector(fixture, '.reports-card--no-transactions'))).toEqual('1 Expense');
  });

  it('onDeleteReport(): should delete report event', () => {
    const deleteReportSpy = spyOn(component.deleteReport, 'emit');

    component.onDeleteReport();
    expect(deleteReportSpy).toHaveBeenCalledTimes(1);
  });

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
