import { HttpClientModule } from '@angular/common/http';
import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { exception } from 'console';
import { of } from 'rxjs';
import { getDummyExpenses } from 'server/test';
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
      imports: [
        IonicModule.forRoot(),
        MatIconModule,
        SharedModule,
        HttpClientModule
      ],
      providers: [
        {provide: ReportService, useValue: ReportServiceSpy}
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



});


