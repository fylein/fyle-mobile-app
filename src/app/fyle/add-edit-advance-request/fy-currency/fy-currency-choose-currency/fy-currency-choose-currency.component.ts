import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, inject, input } from '@angular/core';
import { Observable, from, noop, fromEvent } from 'rxjs';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ModalController } from '@ionic/angular/standalone';
import { LoaderService } from 'src/app/core/services/loader.service';
import {
  concatMap,
  map,
  finalize,
  shareReplay,
  startWith,
  distinctUntilChanged,
  switchMap,
  filter,
} from 'rxjs/operators';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput, MatSuffix } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-fy-currency-choose-currency',
  templateUrl: './fy-currency-choose-currency.component.html',
  styleUrls: ['./fy-currency-choose-currency.component.scss'],
  imports: [IonicModule, MatIcon, MatFormField, MatInput, FormsModule, MatSuffix, AsyncPipe, TranslocoPipe],
})
export class FyCurrencyChooseCurrencyComponent implements OnInit, AfterViewInit {
  private currencyService = inject(CurrencyService);

  private modalController = inject(ModalController);

  private loaderService = inject(LoaderService);

  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild('searchBar') searchBarRef: ElementRef<HTMLInputElement>;

  readonly currentSelection = input<string>(undefined);

  currencies$: Observable<{ shortCode: string; longName: string }[]>;

  filteredCurrencies$: Observable<{ shortCode: string; longName: string }[]>;

  value;

  clearValue(): void {
    this.value = '';
    const searchInput = this.searchBarRef.nativeElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  ngOnInit(): void {
    this.currencies$ = from(this.loaderService.showLoader()).pipe(
      concatMap(() => this.currencyService.getAll()),
      startWith({ INR: this.translocoService.translate('fyCurrencyChooseCurrency.indianRupee') }),
      filter((currenciesObj) => !!currenciesObj),
      map((currenciesObj: { [key: string]: string }) =>
        Object.keys(currenciesObj).map((shortCode) => ({ shortCode, longName: currenciesObj[shortCode] || shortCode })),
      ),
      finalize(() => {
        from(this.loaderService.hideLoader()).subscribe(noop);
      }),
      shareReplay(1),
    );

    this.currencies$.subscribe(noop);
  }

  ngAfterViewInit(): void {
    this.filteredCurrencies$ = fromEvent<Event>(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: Event) => (event.target as HTMLInputElement).value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText: string) =>
        this.currencies$.pipe(
          map((currencies) =>
            currencies.filter(
              (currency) =>
                currency.shortCode.toLowerCase().includes(searchText.toLowerCase()) ||
                currency.longName.toLowerCase().includes(searchText.toLowerCase()),
            ),
          ),
        ),
      ),
      shareReplay(1),
    );
  }

  onDoneClick(): void {
    this.modalController.dismiss();
  }

  onCurrencySelect(currency: { shortCode: string; longName: string }): void {
    this.modalController.dismiss({
      currency,
    });
  }
}
