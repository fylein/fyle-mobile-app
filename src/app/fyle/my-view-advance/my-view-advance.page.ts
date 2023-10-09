import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { from, Observable } from 'rxjs';
import { finalize, shareReplay, switchMap } from 'rxjs/operators';
import { AdvanceService } from 'src/app/core/services/advance.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { StatisticTypes } from 'src/app/shared/components/fy-statistic/statistic-type.enum';
import { getCurrencySymbol } from '@angular/common';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { ExtendedAdvance } from 'src/app/core/models/extended_advance.model';

@Component({
  selector: 'app-my-view-advance',
  templateUrl: './my-view-advance.page.html',
  styleUrls: ['./my-view-advance.page.scss'],
})
export class MyViewAdvancePage {
  advance$: Observable<ExtendedAdvance>;

  projectFieldName = 'Project';

  currencySymbol: string;

  constructor(
    private advanceService: AdvanceService,
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private expenseFieldsService: ExpenseFieldsService
  ) {}

  get StatisticTypes(): typeof StatisticTypes {
    return StatisticTypes;
  }

  // TODO replace forEach with find
  getAndUpdateProjectName(): void {
    this.expenseFieldsService.getAllEnabled().subscribe((expenseFields) => {
      expenseFields.forEach((expenseField) => {
        if (expenseField.column_name === 'project_id') {
          this.projectFieldName = expenseField.field_name;
        }
      });
    });
  }

  ionViewWillEnter(): void {
    const id = this.activatedRoute.snapshot.params.id as string;

    this.advance$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => this.advanceService.getAdvance(id)),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay(1)
    );

    this.advance$.subscribe((advance) => {
      this.currencySymbol = getCurrencySymbol(advance?.adv_currency, 'wide');
    });

    this.getAndUpdateProjectName();
  }
}
