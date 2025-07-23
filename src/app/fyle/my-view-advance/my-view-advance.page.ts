import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { from, Observable } from 'rxjs';
import { finalize, shareReplay, switchMap, tap } from 'rxjs/operators';
import { AdvanceService } from 'src/app/core/services/advance.service';
import { StatisticTypes } from 'src/app/shared/components/fy-statistic/statistic-type.enum';
import { getCurrencySymbol } from '@angular/common';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { ExtendedAdvance } from 'src/app/core/models/extended_advance.model';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { ExtendedAdvanceRequestPublic } from 'src/app/core/models/extended-advance-request-public.model';

@Component({
  selector: 'app-my-view-advance',
  templateUrl: './my-view-advance.page.html',
  styleUrls: ['./my-view-advance.page.scss'],
})
export class MyViewAdvancePage {
  advance$: Observable<ExtendedAdvance>;

  advanceRequest$: Observable<ExtendedAdvanceRequestPublic>;

  projectFieldName = 'Project';

  currencySymbol: string;

  isLoading = true;

  constructor(
    private advanceService: AdvanceService,
    private activatedRoute: ActivatedRoute,
    private expenseFieldsService: ExpenseFieldsService,
    private advanceRequestService: AdvanceRequestService
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
    this.isLoading = true;
    const id = this.activatedRoute.snapshot.params.id as string;

    this.advance$ = this.advanceService.getAdvance(id).pipe(
      tap(() => (this.isLoading = true)),
      finalize(() => (this.isLoading = false)),
      shareReplay(1)
    );

    this.advanceRequest$ = this.advance$.pipe(
      switchMap((advance) => this.advanceRequestService.getAdvanceRequestPlatform(advance.areq_id))
    );

    this.advance$.subscribe((advance) => {
      this.currencySymbol = getCurrencySymbol(advance?.adv_currency, 'wide');
    });

    this.getAndUpdateProjectName();
  }
}
