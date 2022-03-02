import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { from, Observable } from 'rxjs';
import { finalize, shareReplay, switchMap } from 'rxjs/operators';
import { AdvanceService } from 'src/app/core/services/advance.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OfflineService } from 'src/app/core/services/offline.service';

@Component({
  selector: 'app-my-view-advance',
  templateUrl: './my-view-advance.page.html',
  styleUrls: ['./my-view-advance.page.scss'],
})
export class MyViewAdvancePage implements OnInit {
  advance$: Observable<any>;

  projectFieldName: string;

  constructor(
    private advanceService: AdvanceService,
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private offlineService: OfflineService
  ) {}

  // TODO replace forEach with find
  getAndUpdateProjectName() {
    this.offlineService.getAllEnabledExpenseFields().subscribe((expenseFields) => {
      expenseFields.forEach((expenseField) => {
        if (expenseField.column_name === 'project_id') {
          this.projectFieldName = expenseField.field_name;
        }
      });
    });
  }

  ionViewWillEnter() {
    const id = this.activatedRoute.snapshot.params.id;

    this.advance$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => this.advanceService.getAdvance(id)),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay(1)
    );

    this.getAndUpdateProjectName();
  }

  ngOnInit() {}
}
