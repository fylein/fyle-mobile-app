import { getCurrencySymbol } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TaskCta } from 'src/app/core/models/task-cta.model';
import { DashboardTask } from 'src/app/core/models/task.model';
import { OfflineService } from 'src/app/core/services/offline.service';

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

  constructor(private offlineService: OfflineService) {}

  ngOnInit(): void {
    this.homeCurrency$ = this.offlineService.getHomeCurrency();
    this.currencySymbol$ = this.homeCurrency$.pipe(
      map((homeCurrency: string) => getCurrencySymbol(homeCurrency, 'wide'))
    );
    this.showReportAutoSubmissionInfo =
      this.task.header.includes('Incomplete expense') && !!this.autoSubmissionReportDate;
  }

  taskCtaClicked(event) {
    this.ctaClicked.emit(event);
  }

  onInfoCardClicked() {
    this.infoCardClicked.emit();
  }
}
