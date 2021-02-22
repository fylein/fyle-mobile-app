import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { exception } from 'console';
import { of } from 'rxjs';
import { getDummyExpenses } from 'server/test';
import {click} from 'server/test-utils';
import { Expense } from 'src/app/core/models/expense.model';
import { ReportService } from 'src/app/core/services/report.service';
import { SharedModule } from 'src/app/shared/shared.module';

import { MyExpensesCardComponent } from './my-expenses-card.component';


fdescribe('MyExpensesCardComponent', () => {
  let component: MyExpensesCardComponent;
  let fixture: ComponentFixture<MyExpensesCardComponent>;
  let reportService: any;
  let expense: Expense;
  let debugElement: DebugElement;

  beforeEach(async(() => {
    const ReportServiceSpy = jasmine.createSpyObj('ReportService', ['getAllOpenReportsCount']);
    TestBed.configureTestingModule({
      declarations: [ MyExpensesCardComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      imports: [
        IonicModule.forRoot(),
        MatIconModule,
        SharedModule,
        HttpClientModule,
        MatRippleModule
      ],
      providers: [
        {provide: ReportService, useValue: ReportServiceSpy},
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyExpensesCardComponent);
    component = fixture.componentInstance;
    reportService = TestBed.get(ReportService);
    expense = getDummyExpenses().data[0];
    component.expense = {
      ...expense,
      tx_amount: 0
    };
    reportService.getAllOpenReportsCount.and.returnValue(of(0));
    debugElement = fixture.debugElement; 
  }));

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create an expense of currency INR', () => {
    component.expense = {
      ...expense,
      tx_currency: 'INR',
    }
    fixture.detectChanges();    
    const currencyText = debugElement.query(By.css(".my-expenses-card--currency"));
    expect(currencyText.nativeElement.textContent).toMatch('INR', 'Wrong currency');
  });

  it('should create an expense of amount 67.92', () => {
    component.expense = {
      ...expense,
      tx_amount: 67.92190,
    }
    fixture.detectChanges();    
    const amountText = debugElement.query(By.css(".my-expenses-card--amount"));
    expect(amountText.nativeElement.textContent).toMatch('67.92', 'Wrong Amount');
  });

  it('should create an expense with policy violated', () => {
    component.expense = {
      ...expense,
      tx_policy_amount: 0,
      tx_id: 'tx12345'
    };
    
    fixture.detectChanges();    
    const policyViolatedBlock = debugElement.query(By.css(".my-expenses-card--decorator__critical-policy-violation"));
    expect(policyViolatedBlock).toBeTruthy('Policy violated block not available');
  });

  it('should display Add to new report when clicked on 3 dots', async(() => {
    component.selectionMode = false;
    fixture.detectChanges();
    const moreActionButton = debugElement.queryAll(By.css(".my-expenses-card--more"));
    click(moreActionButton[0].parent);
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      const addToNewReportBlock = debugElement.query(By.css(".my-expenses-card-menu--action__comments"));
      expect(addToNewReportBlock.nativeElement.textContent).toMatch('Add to New Report', 'Can\'t find Add to new Report');
    });
    
  }));



});


