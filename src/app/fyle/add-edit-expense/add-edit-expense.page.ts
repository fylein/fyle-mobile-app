import { Component, OnInit } from '@angular/core';
import { Observable, of, iif } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-add-edit-expense',
  templateUrl: './add-edit-expense.page.html',
  styleUrls: ['./add-edit-expense.page.scss'],
})
export class AddEditExpensePage implements OnInit {
  etxn$: Observable<any>;

  constructor(
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    const newExpensePipe = of({});

    const editExpensePipe = of({});

    this.etxn$ = iif(() => this.activatedRoute.snapshot.params.id, editExpensePipe, newExpensePipe).pipe(
      concatMap((etxn) => {
        if (this.activatedRoute.snapshot.params.dataUrl) {
          // fetch parsed data and add to etxn
        } else {
          return of(etxn);
        }
      })
    );

  }

}
