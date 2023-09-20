import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { Observable, noop, from, fromEvent } from 'rxjs';
import { map, finalize, concatMap, shareReplay, startWith, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';
import { Currency } from 'src/app/core/models/currency.model';

@Component({
  selector: 'app-select-currency',
  templateUrl: './select-currency.component.html',
  styleUrls: ['./select-currency.component.scss'],
})
export class SelectCurrencyComponent implements OnInit, AfterViewInit {
  @Input() currentSelection: string;

  @ViewChild('searchBar') searchBarRef: ElementRef<HTMLInputElement>;

  currencies$: Observable<Currency[]>;

  filteredCurrencies$: Observable<Currency[]>;

  value: string;

  constructor(
    private currencyService: CurrencyService,
    private modalController: ModalController,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.currencies$ = from(this.loaderService.showLoader()).pipe(
      concatMap(() => this.currencyService.getAll()),
      map((currenciesObj) =>
        Object.keys(currenciesObj).map((shortCode) => ({ shortCode, longName: currenciesObj[shortCode] || shortCode }))
      ),
      finalize(() => {
        from(this.loaderService.hideLoader()).subscribe(noop);
      }),
      shareReplay(1)
    );

    this.currencies$.subscribe(noop);
  }

  ngAfterViewInit(): void {
    this.filteredCurrencies$ = fromEvent<{ srcElement: { value: string } }>(
      this.searchBarRef.nativeElement,
      'keyup'
    ).pipe(
      map((event) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText: string) =>
        this.currencies$.pipe(
          map((currencies) =>
            currencies.filter(
              (currency) =>
                currency.shortCode.toLowerCase().includes(searchText.toLowerCase()) ||
                currency.longName.toLowerCase().includes(searchText.toLowerCase())
            )
          )
        )
      ),
      shareReplay(1)
    );
  }

  closeModal(): void {
    this.modalController.dismiss();
  }

  onCurrencySelect(selectedCurrency: Currency): void {
    this.modalController.dismiss({
      selectedCurrency,
    });
  }

  clearValue(): void {
    this.value = '';
    const searchInput = this.searchBarRef.nativeElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }
}
