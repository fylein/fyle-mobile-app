import { getCurrencySymbol, NgClass, AsyncPipe } from '@angular/common';
import { Component, Input, OnInit, inject, output } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TaskCta } from 'src/app/core/models/task-cta.model';
import { DashboardTask } from 'src/app/core/models/dashboard-task.model';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { TranslocoService } from '@jsverse/transloco';
import { MatRipple } from '@angular/material/core';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-tasks-card',
    templateUrl: './tasks-card.component.html',
    styleUrls: ['./tasks-card.component.scss'],
    imports: [
        MatRipple,
        IonicModule,
        NgClass,
        AsyncPipe,
    ],
})
export class TasksCardComponent implements OnInit {
  private currencyService = inject(CurrencyService);

  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() task: DashboardTask;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() autoSubmissionReportDate: Date;

  readonly ctaClicked = output<TaskCta>();

  readonly infoCardClicked = output<void>();

  homeCurrency$: Observable<string>;

  currencySymbol$: Observable<string>;

  showReportAutoSubmissionInfo = false;

  ngOnInit(): void {
    this.homeCurrency$ = this.currencyService.getHomeCurrency();
    this.currencySymbol$ = this.homeCurrency$.pipe(
      map((homeCurrency: string) => getCurrencySymbol(homeCurrency, 'wide')),
    );
    this.showReportAutoSubmissionInfo =
      this.task.header.includes(this.translocoService.translate('tasksCard.incompleteExpense')) &&
      !!this.autoSubmissionReportDate;
  }

  taskCtaClicked(task: DashboardTask): void {
    this.ctaClicked.emit(task.ctas[0]);
  }

  onInfoCardClicked(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.infoCardClicked.emit();
  }
}
