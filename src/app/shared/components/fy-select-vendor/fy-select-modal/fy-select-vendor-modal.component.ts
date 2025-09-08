import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Input,
  ChangeDetectorRef,
  inject,
  input,
} from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { Observable, fromEvent, from, combineLatest } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { map, startWith, distinctUntilChanged, switchMap, catchError, finalize } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { VendorService } from 'src/app/core/services/vendor.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { VendorListItem } from 'src/app/core/models/vendor.model';
import { Merchant } from 'src/app/core/models/platform/platform-merchants.model';
import { UtilityService } from 'src/app/core/services/utility.service';

@Component({
  selector: 'app-fy-select-vendor-modal',
  templateUrl: './fy-select-vendor-modal.component.html',
  styleUrls: ['./fy-select-vendor-modal.component.scss'],
  standalone: false,
})
export class FySelectVendorModalComponent implements OnInit, AfterViewInit {
  private modalController = inject(ModalController);

  private cdr = inject(ChangeDetectorRef);

  private vendorService = inject(VendorService);

  private recentLocalStorageItemsService = inject(RecentLocalStorageItemsService);

  private utilityService = inject(UtilityService);

  private translocoService = inject(TranslocoService);

  @ViewChild('searchBar') searchBarRef!: ElementRef<HTMLInputElement>;

  @Input() filteredOptions$!: Observable<VendorListItem[]>;

  readonly currentSelection = input<Merchant | null>(null);

  recentrecentlyUsedItems$!: Observable<VendorListItem[]>;

  value = '';

  isLoading = false;

  selectableOptions: VendorListItem[] = [];

  ngOnInit(): void {
    // Component initialization - no specific logic needed at this time
  }

  clearValue(): void {
    this.value = '';
    const searchInput = this.searchBarRef.nativeElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  getRecentlyUsedVendors(): Observable<VendorListItem[]> {
    return from(this.recentLocalStorageItemsService.get('recentVendorList')).pipe(
      map((options: VendorListItem[]) =>
        options.map((option) => {
          option.selected = isEqual(option.value, this.currentSelection());
          return option;
        }),
      ),
    );
  }

  ngAfterViewInit(): void {
    this.filteredOptions$ = fromEvent<KeyboardEvent>(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: KeyboardEvent) => (event.target as HTMLInputElement).value),
      distinctUntilChanged(),
      switchMap((searchText: string) => {
        searchText = searchText.trim();
        if (searchText) {
          // set isLoading to true
          this.isLoading = true;
          // run ChangeDetectionRef.detectChanges to avoid 'expression has changed after it was checked error'.
          // More details about CDR: https://angular.io/api/core/ChangeDetectorRef
          this.cdr.detectChanges();
          return this.vendorService.getMerchants(searchText).pipe(
            map((vendors) =>
              vendors.map((vendor) => ({
                label: vendor.display_name,
                value: vendor,
              })),
            ),
            catchError(() => []), // api fails on empty searchText and if app is offline - failsafe here
            map((vendors: VendorListItem[]) => {
              const noneOption: VendorListItem = {
                label: this.translocoService.translate('fySelectVendorModal.none'),
                value: null as unknown as Merchant,
              };
              return [noneOption, ...vendors];
            }),
            finalize(() => {
              // set isLoading to false
              this.isLoading = false;
              // run ChangeDetectionRef.detectChanges to avoid 'expression has changed after it was checked error'.
              // More details about CDR: https://angular.io/api/core/ChangeDetectorRef
              this.cdr.detectChanges();
            }),
          );
        } else {
          return [];
        }
      }),
      startWith([
        {
          label: this.translocoService.translate('fySelectVendorModal.none'),
          value: null as unknown as Merchant,
        },
      ]),
      map((vendors: VendorListItem[]) => {
        if (this.currentSelection() && !vendors.some((vendor) => isEqual(vendor.value, this.currentSelection()))) {
          const currentSelectionItem: VendorListItem = {
            label: this.currentSelection().display_name,
            value: this.currentSelection(),
          };
          vendors = [...vendors, currentSelectionItem];
        }

        return vendors.map((vendor) => {
          if (isEqual(vendor.value, this.currentSelection())) {
            vendor.selected = true;
          }
          return vendor;
        });
      }),
    );

    this.recentrecentlyUsedItems$ = fromEvent<KeyboardEvent>(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: KeyboardEvent) => (event.target as HTMLInputElement).value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText: string) =>
        this.getRecentlyUsedVendors().pipe(
          // filtering of recently used items wrt searchText is taken care in service method
          this.utilityService.searchArrayStream(searchText),
        ),
      ),
    );

    combineLatest({
      filteredOptions: this.filteredOptions$,
      recentlyUsedItems: this.recentrecentlyUsedItems$,
    }).subscribe(({ filteredOptions, recentlyUsedItems }) => {
      const recentlyUsedItemsUpdated = recentlyUsedItems.map((recentItem) => {
        recentItem.isRecentlyUsed = true;
        return recentItem;
      });
      this.selectableOptions = [...recentlyUsedItemsUpdated, ...filteredOptions];
      this.cdr.detectChanges();
    });

    this.cdr.detectChanges();
  }

  onDoneClick(): void {
    this.modalController.dismiss();
  }

  onElementSelect(option: VendorListItem): void {
    if (option.value) {
      this.recentLocalStorageItemsService.post('recentVendorList', option, 'label');
    }
    this.modalController.dismiss(option);
  }

  onNewSelect(): void {
    this.value = this.value.trim();
    const newOption: VendorListItem = {
      label: this.value,
      value: { display_name: this.value } as Merchant,
    };
    this.recentLocalStorageItemsService.post('recentVendorList', newOption, 'label');
    this.modalController.dismiss(newOption);
  }
}
