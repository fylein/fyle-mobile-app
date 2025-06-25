import { getCurrencySymbol } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TaskCta } from 'src/app/core/models/task-cta.model';
import { DashboardTask } from 'src/app/core/models/dashboard-task.model';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-tasks-card',
  templateUrl: './tasks-card.component.html',
  styleUrls: ['./tasks-card.component.scss'],
})
export class TasksCardComponent implements OnInit {
  @Input() task: DashboardTask;

  @Input() autoSubmissionReportDate: Date;

  @Output() ctaClicked = new EventEmitter<TaskCta>();

  @Output() infoCardClicked = new EventEmitter<void>();

  homeCurrency$: Observable<string>;

  currencySymbol$: Observable<string>;

  showReportAutoSubmissionInfo = false;

  constructor(private currencyService: CurrencyService, private translocoService: TranslocoService) {}

  ngOnInit(): void {
    this.homeCurrency$ = this.currencyService.getHomeCurrency();
    this.currencySymbol$ = this.homeCurrency$.pipe(
      map((homeCurrency: string) => getCurrencySymbol(homeCurrency, 'wide'))
    );
    this.showReportAutoSubmissionInfo =
      this.task.header.includes(this.translocoService.translate('tasksCard.incompleteExpense')) &&
      !!this.autoSubmissionReportDate;
  }

  taskCtaClicked(task: DashboardTask): void {
    this.ctaClicked.emit(task.ctas[0]);
  }

  onInfoCardClicked(): void {
    this.infoCardClicked.emit();
  }
}
