import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, ChangeDetectorRef } from '@angular/core';
import { Observable, fromEvent, from, combineLatest } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { map, startWith, distinctUntilChanged, switchMap, catchError, finalize } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { VendorService } from 'src/app/core/services/vendor.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { Vendor, VendorListItem } from 'src/app/core/models/vendor.model';
import { UtilityService } from 'src/app/core/services/utility.service';
@Component({
  selector: 'app-fy-select-vendor-modal',
  templateUrl: './fy-select-vendor-modal.component.html',
  styleUrls: ['./fy-select-vendor-modal.component.scss'],
})
export class FySelectVendorModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;

  @Input() currentSelection: any;

  @Input() filteredOptions$: Observable<VendorListItem[]>;

  recentrecentlyUsedItems$: Observable<VendorListItem[]>;

  value = '';

  isLoading = false;

  selectableOptions: { label: string; value: any; selected?: boolean }[] = [];

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private vendorService: VendorService,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService,
    private utilityService: UtilityService
  ) {}

  ngOnInit() {}

  clearValue() {
    this.value = '';
    const searchInput = this.searchBarRef.nativeElement as HTMLInputElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  getRecentlyUsedVendors() {
    return from(this.recentLocalStorageItemsService.get('recentVendorList')).pipe(
      map((options: VendorListItem[]) =>
        options.map((option) => {
          option.selected = isEqual(option.value, this.currentSelection);
          return option;
        })
      )
    );
  }

  ngAfterViewInit() {
    this.filteredOptions$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      distinctUntilChanged(),
      switchMap((searchText) => {
        searchText = searchText.trim();
        if (searchText) {
          // set isLoading to true
          this.isLoading = true;
          // run ChangeDetectionRef.detectChanges to avoid 'expression has changed after it was checked error'.
          // More details about CDR: https://angular.io/api/core/ChangeDetectorRef
          this.cdr.detectChanges();
          return this.vendorService.get(searchText).pipe(
            map((vendors) =>
              vendors.map((vendor) => ({
                label: vendor.display_name,
                value: vendor,
              }))
            ),
            catchError((err) => []), // api fails on empty searchText and if app is offline - failsafe here
            map((vendors) => [{ label: 'None', value: null }].concat(vendors)),
            finalize(() => {
              // set isLoading to false
              this.isLoading = false;
              // run ChangeDetectionRef.detectChanges to avoid 'expression has changed after it was checked error'.
              // More details about CDR: https://angular.io/api/core/ChangeDetectorRef
              this.cdr.detectChanges();
            })
          );
        } else {
          return [];
        }
      }),
      startWith([{ label: 'None', value: null }]),
      map((vendors: VendorListItem[]) => {
        if (!vendors.some((vendor) => isEqual(vendor.value, this.currentSelection))) {
          vendors = vendors.concat({
            label: this.currentSelection.display_name,
            value: this.currentSelection,
          });
        }

        return vendors.map((vendor) => {
          if (isEqual(vendor.value, this.currentSelection)) {
            vendor.selected = true;
          }
          return vendor;
        });
      })
    );

    this.recentrecentlyUsedItems$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText) =>
        this.getRecentlyUsedVendors().pipe(
          // filtering of recently used items wrt searchText is taken care in service method
          this.utilityService.searchArrayStream(searchText)
        )
      )
    );

    combineLatest({
      filteredOptions: this.filteredOptions$,
      recentlyUsedItems: this.recentrecentlyUsedItems$,
    }).subscribe(({ filteredOptions, recentlyUsedItems }) => {
      const recentlyUsedItemsUpdated = recentlyUsedItems.map((v) => {
        v.isRecentlyUsed = true;
        return v;
      });
      this.selectableOptions = [...recentlyUsedItemsUpdated, ...filteredOptions];
      console.log('check selectable options', this.selectableOptions);
      this.cdr.detectChanges();
    });

    this.cdr.detectChanges();
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  onElementSelect(option: VendorListItem) {
    if (option.value) {
      this.recentLocalStorageItemsService.post('recentVendorList', option, 'label');
    }
    this.modalController.dismiss(option);
  }

  onNewSelect() {
    this.value = this.value.trim();
    const newOption = { label: this.value, value: { display_name: this.value } };
    this.recentLocalStorageItemsService.post('recentVendorList', newOption, 'label');
    this.modalController.dismiss(newOption);
  }
}
