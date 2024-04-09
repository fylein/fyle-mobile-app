import { getCurrencySymbol } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TaskCta } from 'src/app/core/models/task-cta.model';
import { DashboardTask } from 'src/app/core/models/dashboard-task.model';
import { CurrencyService } from 'src/app/core/services/currency.service';

@Component({
  selector: 'app-tasks-card',
  templateUrl: './tasks-card.component.html',
  styleUrls: ['./tasks-card.component.scss'],
})
export class TasksCardComponent implements OnInit {
  @Input() task: DashboardTask;

  @Input() autoSubmissionReportDate: Date;

  @Output() ctaClicked: EventEmitter<TaskCta> = new EventEmitter();

  @Output() infoCardClicked = new EventEmitter();

  homeCurrency$: Observable<string>;

  currencySymbol$: Observable<string>;

  showReportAutoSubmissionInfo = false;

  constructor(private currencyService: CurrencyService) {}

  ngOnInit(): void {
    this.homeCurrency$ = this.currencyService.getHomeCurrency();
    this.currencySymbol$ = this.homeCurrency$.pipe(
      map((homeCurrency: string) => getCurrencySymbol(homeCurrency, 'wide'))
    );
    this.showReportAutoSubmissionInfo =
      this.task.header.includes('Incomplete expense') && !!this.autoSubmissionReportDate;
  }

  taskCtaClicked(task: DashboardTask) {
    this.ctaClicked.emit(task.ctas[0]);
  }

  onInfoCardClicked() {
    this.infoCardClicked.emit();
  }
}
