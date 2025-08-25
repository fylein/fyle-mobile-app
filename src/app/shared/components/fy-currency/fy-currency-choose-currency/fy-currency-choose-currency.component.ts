import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  AfterViewInit,
  ChangeDetectorRef,
  TemplateRef,
  inject,
  input,
} from '@angular/core';
import { Observable, from, noop, fromEvent, of } from 'rxjs';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ModalController } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';
import { concatMap, map, finalize, shareReplay, startWith, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { RecentLocalStorageItemsService } from '../../../../core/services/recent-local-storage-items.service';
import { Currency } from 'src/app/core/models/currency.model';

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

  private recentLocalStorageItemsService = inject(RecentLocalStorageItemsService);

  private cdr = inject(ChangeDetectorRef);

  @ViewChild('searchBar') searchBarRef: ElementRef<HTMLInputElement>;

  readonly currentSelection = input<string>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() recentlyUsed: Currency[];

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() selectionElement: TemplateRef<ElementRef>;

  currencies$: Observable<Currency[]>;

  filteredCurrencies$: Observable<Currency[]>;

  recentlyUsedCurrencies$: Observable<Currency[]>;

  value = '';

  clearValue(): void {
    this.value = '';
    const searchInput = this.searchBarRef.nativeElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  ngOnInit(): void {
    this.currencies$ = from(this.loaderService.showLoader()).pipe(
      concatMap(() => this.currencyService.getAll()),
      map((currenciesObj) =>
        Object.keys(currenciesObj).map((shortCode) => ({ shortCode, longName: currenciesObj[shortCode] || shortCode })),
      ),
      finalize(() => {
        from(this.loaderService.hideLoader()).subscribe(noop);
      }),
      shareReplay(1),
    );

    this.currencies$.subscribe(noop);
  }

  getRecentlyUsedItems(): Observable<Currency[]> {
    if (this.recentlyUsed) {
      return of(this.recentlyUsed);
    } else {
      return of([]);
    }
  }

  ngAfterViewInit(): void {
    this.filteredCurrencies$ = fromEvent<KeyboardEvent>(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event) => (event.target as HTMLInputElement).value),
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

    this.recentlyUsedCurrencies$ = fromEvent<KeyboardEvent>(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event) => (event.target as HTMLInputElement).value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText: string) =>
        this.getRecentlyUsedItems().pipe(
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

    this.cdr.detectChanges();
  }

  onDoneClick(): void {
    this.modalController.dismiss();
  }

  onCurrencySelect(currency: Currency): void {
    this.recentLocalStorageItemsService.post('recent-currency-cache', currency, 'label');
    this.modalController.dismiss({
      currency,
    });
  }
}
