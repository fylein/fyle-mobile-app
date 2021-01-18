import { Component, OnInit, ViewChild, ElementRef, Input, AfterViewInit } from '@angular/core';
import { Observable, from, noop, fromEvent } from 'rxjs';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ModalController } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';
import { concatMap, map, finalize, shareReplay, startWith, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { RecentLocalStorageItemsService } from '../../../../core/services/recent-local-storage-items.service';

@Component({
  selector: 'app-fy-currency-choose-currency',
  templateUrl: './fy-currency-choose-currency.component.html',
  styleUrls: ['./fy-currency-choose-currency.component.scss'],
})
export class FyCurrencyChooseCurrencyComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;

  @Input() currentSelection: string;

  currencies$: Observable<{ shortCode: string, longName: string }[]>;
  filteredCurrencies$: Observable<{ shortCode: string, longName: string }[]>;
  value;

  constructor(
    private currencyService: CurrencyService,
    private modalController: ModalController,
    private loaderService: LoaderService,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService
  ) { }

  clearValue() {
    this.value = '';
    const searchInput = this.searchBarRef.nativeElement as HTMLInputElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  ngOnInit() {
    this.currencies$ = from(this.loaderService.showLoader()).pipe(
      concatMap(() => {
        return this.currencyService.getAll();
      }),
      map(currenciesObj => Object.keys(currenciesObj).map(shortCode => ({ shortCode, longName: currenciesObj[shortCode] }))),
      finalize(() => {
        from(this.loaderService.hideLoader()).subscribe(noop);
      }),
      shareReplay(1)
    );

    this.currencies$.subscribe(noop);
  }

  ngAfterViewInit(): void {
    this.filteredCurrencies$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText) => {
        return this.currencies$.pipe(
          map(
            currencies => currencies
              .filter(
                currency => currency.shortCode.toLowerCase().includes(searchText.toLowerCase())
                  || currency.longName.toLowerCase().includes(searchText.toLowerCase())
              )
          )
        );
      })
    );
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  onCurrencySelect(currency) {
    this.recentLocalStorageItemsService.post('recent-currency-cache', currency, 'label');
    this.modalController.dismiss({
      currency
    });
  }
}
