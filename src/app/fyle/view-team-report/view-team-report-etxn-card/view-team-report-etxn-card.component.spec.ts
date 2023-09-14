import { DatePipe, CurrencyPipe } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { IonicModule } from '@ionic/angular';
import { getElementBySelector, click, getTextContent } from 'src/app/core/dom-helpers';
import { expenseData1 } from 'src/app/core/mock-data/expense.data';
import { FyCategoryIconComponent } from 'src/app/shared/components/fy-category-icon/fy-category-icon.component';
import { EllipsisPipe } from 'src/app/shared/pipes/ellipses.pipe';
import { ViewTeamReportEtxnCardComponent } from './view-team-report-etxn-card.component';

describe('ViewTeamReportEtxnCardComponent', () => {
  let component: ViewTeamReportEtxnCardComponent;
  let fixture: ComponentFixture<ViewTeamReportEtxnCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ViewTeamReportEtxnCardComponent, FyCategoryIconComponent, EllipsisPipe, DatePipe, CurrencyPipe],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewTeamReportEtxnCardComponent);
    component = fixture.componentInstance;
    component.etxn = expenseData1;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('goToTransactionClicked(): should emit event when clicked on transaction', () => {
    component.etxnIndex = 1;
    fixture.detectChanges();
    const goToTxnSpy = spyOn(component.goToTransaciton, 'emit');

    const goToTxnButton = getElementBySelector(fixture, '.etxn-card--body') as HTMLElement;
    click(goToTxnButton);
    expect(goToTxnSpy).toHaveBeenCalledOnceWith({ etxn: expenseData1, etxnIndex: 1 });
  });

  it('should show txn data properly', () => {
    expect(getTextContent(getElementBySelector(fixture, '.etxn-card--currency'))).toEqual(expenseData1.tx_currency);
    expect(getTextContent(getElementBySelector(fixture, '.etxn-card--amount'))).toEqual(`${expenseData1.tx_amount}.00`);
    expect(getTextContent(getElementBySelector(fixture, '.etxn-card--vendor'))).toEqual(``);
    expect(getTextContent(getElementBySelector(fixture, '.etxn-card--category'))).toEqual(
      `${expenseData1.tx_org_category}`
    );
  });

  it('should show date if txn date not equal to previous date', () => {
    component.prevDate = new Date();
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.etxn-card--date'))).toEqual('Wednesday ,  Nov 30, 2022');
  });

  it('should not show date if txn date equal to previous date', () => {
    component.prevDate = new Date(expenseData1.tx_txn_dt);
    fixture.detectChanges();
    component.ngOnInit();
    expect(getTextContent(getElementBySelector(fixture, '.etxn-card--date'))).toEqual('Wednesday ,  Nov 30, 2022');
    expect(component.showDate).toBeFalse();
  });
});
