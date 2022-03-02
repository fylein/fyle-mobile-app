import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { from, Observable } from 'rxjs';
import { finalize, shareReplay, switchMap } from 'rxjs/operators';
import { AdvanceService } from 'src/app/core/services/advance.service';
import { LoaderService } from 'src/app/core/services/loader.service';

@Component({
  selector: 'app-my-view-advance',
  templateUrl: './my-view-advance.page.html',
  styleUrls: ['./my-view-advance.page.scss'],
})
export class MyViewAdvancePage implements OnInit {
  advance$: Observable<any>;

  statisticType = {
    string: 'string',
    number: 'number',
    date: 'date',
    boolean: 'boolean',
  };

  constructor(
    private advanceService: AdvanceService,
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService
  ) {}

  ionViewWillEnter() {
    const id = this.activatedRoute.snapshot.params.id;

    this.advance$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => this.advanceService.getAdvance(id)),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay(1)
    );
  }

  ngOnInit() {}
}
