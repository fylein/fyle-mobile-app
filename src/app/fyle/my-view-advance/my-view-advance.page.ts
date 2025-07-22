import { Component } from '@angular/core';
import { ActivatedRoute, RouterLinkActive, RouterLink } from '@angular/router';
import { from, Observable } from 'rxjs';
import { finalize, shareReplay, switchMap } from 'rxjs/operators';
import { AdvanceService } from 'src/app/core/services/advance.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { StatisticTypes } from 'src/app/shared/components/fy-statistic/statistic-type.enum';
import { getCurrencySymbol, AsyncPipe, TitleCasePipe, DatePipe } from '@angular/common';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { ExtendedAdvance } from 'src/app/core/models/extended_advance.model';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { ExtendedAdvanceRequestPublic } from 'src/app/core/models/extended-advance-request-public.model';
import { IonicModule } from '@ionic/angular';
import { FySummaryTileComponent } from '../../shared/components/summary-tile/summary-tile.component';
import { FyStatisticComponent } from '../../shared/components/fy-statistic/fy-statistic.component';

@Component({
  selector: 'app-my-view-advance',
  templateUrl: './my-view-advance.page.html',
  styleUrls: ['./my-view-advance.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    RouterLinkActive,
    RouterLink,
    FySummaryTileComponent,
    FyStatisticComponent,
    AsyncPipe,
    TitleCasePipe,
    DatePipe,
  ],
})
export class MyViewAdvancePage {
  advance$: Observable<ExtendedAdvance>;

  advanceRequest$: Observable<ExtendedAdvanceRequestPublic>;

  projectFieldName = 'Project';

  currencySymbol: string;

  constructor(
    private advanceService: AdvanceService,
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
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
    const id = this.activatedRoute.snapshot.params.id as string;

    this.advance$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => this.advanceService.getAdvance(id)),
      finalize(() => from(this.loaderService.hideLoader())),
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
