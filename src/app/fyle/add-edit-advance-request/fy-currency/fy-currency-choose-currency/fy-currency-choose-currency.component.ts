import { Component, OnInit, ViewChild, ElementRef, Input, AfterViewInit, inject } from '@angular/core';
import { Observable, from, noop, fromEvent } from 'rxjs';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ModalController } from '@ionic/angular';
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
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-currency-choose-currency',
  templateUrl: './fy-currency-choose-currency.component.html',
  styleUrls: ['./fy-currency-choose-currency.component.scss'],
  standalone: false,
})
export class FyCurrencyChooseCurrencyComponent implements OnInit, AfterViewInit {
  private currencyService = inject(CurrencyService);

  private modalController = inject(ModalController);

  private loaderService = inject(LoaderService);

  private translocoService = inject(TranslocoService);

  @ViewChild('searchBar') searchBarRef: ElementRef<HTMLInputElement>;

  @Input() currentSelection: string;

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
