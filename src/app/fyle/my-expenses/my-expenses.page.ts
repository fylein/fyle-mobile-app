import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { fromEvent, from, BehaviorSubject, Subject, Observable } from 'rxjs';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { NetworkService } from 'src/app/core/services/network.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-my-expenses',
  templateUrl: './my-expenses.page.html',
  styleUrls: ['./my-expenses.page.scss'],
})
export class MyExpensesPage implements OnInit, AfterViewInit {

  pageState = 'all';
  navigationChange$: Subject<string> = new Subject();
  simpleSearch$: Observable<string>;
  expenses$: Observable<any[]>;

  @ViewChild('simpleSearchInput') simpleSearchInput: ElementRef;

  constructor(
    private networkService: NetworkService,
    private transactionService: TransactionService
  ) { }

  ngOnInit() {
    this.expenses$ = this.transactionService.getV2Expenses({}).pipe(
      map(res => res.data),
      tap(console.log)
    );
  }

  ngAfterViewInit() {
    this.simpleSearch$ = fromEvent(this.simpleSearchInput.nativeElement, 'keyup');
  }

  onTabNavigationChange(event: MatButtonToggleChange) {
    this.navigationChange$.next(event.value);
  }

}
