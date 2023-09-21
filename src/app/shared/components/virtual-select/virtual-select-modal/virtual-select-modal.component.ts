import { Component, ViewChild, ElementRef, AfterViewInit, Input, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { combineLatest, from, fromEvent, Observable, of } from 'rxjs';
import { map, startWith, distinctUntilChanged, switchMap, shareReplay } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { cloneDeep, isEqual } from 'lodash';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { VirtualSelectOption } from './virtual-select-option.interface';
@Component({
  selector: 'app-virtual-select-modal',
  templateUrl: './virtual-select-modal.component.html',
  styleUrls: ['./virtual-select-modal.component.scss'],
})
export class VirtualSelectModalComponent implements AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef<HTMLInputElement>;

  @Input() options: VirtualSelectOption[] = [];

  @Input() currentSelection: VirtualSelectOption;

  @Input() selectionElement: TemplateRef<ElementRef>;

  @Input() nullOption = true;

  @Input() cacheName: string;

  @Input() enableSearch;

  @Input() selectModalHeader = '';

  @Input() showSaveButton = false;

  @Input() placeholder: string;

  @Input() defaultLabelProp: string;

  @Input() recentlyUsed: VirtualSelectOption[];

  @Input() label;

  value = '';

  recentlyUsedItems$: Observable<VirtualSelectOption[]>;

  filteredOptions$: Observable<VirtualSelectOption[]>;

  selectableOptions: VirtualSelectOption[] = [];

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService,
    private utilityService: UtilityService
  ) {}

  clearValue(): void {
    this.value = '';
    const searchInput = this.searchBarRef.nativeElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  getRecentlyUsedItems(): Observable<VirtualSelectOption[]> {
    // Check if recently items exists from api and set, else, set the recent items from the localStorage
    if (this.recentlyUsed) {
      return of(this.recentlyUsed);
    } else {
      return (from(this.recentLocalStorageItemsService.get(this.cacheName)) as Observable<VirtualSelectOption[]>).pipe(
        map((options) =>
          options
            .filter((option) => option.custom || this.options.map((op) => op.label).includes(option.label))
            .map((option: { label: string; value: object; selected?: boolean }) => {
              option.selected = isEqual(option.value, this.currentSelection);
              return option;
            })
        )
      );
    }
  }

  setSelectableOptions(): void {
    combineLatest({
      filteredOptions: this.filteredOptions$,
      recentlyUsedItems: this.recentlyUsedItems$,
    }).subscribe(({ filteredOptions, recentlyUsedItems }) => {
      const recentlyUsedItemsUpdated = cloneDeep(recentlyUsedItems).map((v) => {
        v.isRecentlyUsed = true;
        v.selected = false;
        return v;
      });
      this.selectableOptions = recentlyUsedItemsUpdated.concat(filteredOptions);
      this.cdr.detectChanges();
    });
  }

  setFilteredOptions(searchText: string): VirtualSelectOption[] {
    const initial: VirtualSelectOption[] = [];

    if (this.nullOption && this.currentSelection) {
      initial.push({ label: 'None', value: null });
    }

    let extraOption: VirtualSelectOption[] = [];
    if (this.currentSelection && this.defaultLabelProp) {
      const selectedOption: VirtualSelectOption = this.options.find((option) =>
        isEqual(option.value, this.currentSelection)
      );
      if (!selectedOption) {
        extraOption = extraOption.concat({
          label: this.currentSelection[this.defaultLabelProp] as string,
          value: this.currentSelection,
          selected: false,
        });
      }
    }

    return initial.concat(
      this.options
        .concat(extraOption)
        .filter((option) => option.label.toLowerCase().includes(searchText.toLowerCase()))
        .sort((element1, element2) => element1.label.localeCompare(element2.label))
        .map((option) => {
          option.selected = isEqual(option.value, this.currentSelection);
          return option;
        })
    );
  }

  ngAfterViewInit(): void {
    if (this.searchBarRef && this.searchBarRef.nativeElement) {
      this.filteredOptions$ = fromEvent<{ target: HTMLInputElement }>(this.searchBarRef.nativeElement, 'keyup').pipe(
        map((event) => event.target.value),
        startWith(''),
        distinctUntilChanged(),
        map((searchText: string) => this.setFilteredOptions(searchText)),
        shareReplay(1)
      );
      this.recentlyUsedItems$ = fromEvent<{ target: HTMLInputElement }>(this.searchBarRef.nativeElement, 'keyup').pipe(
        map((event) => event.target.value),
        startWith(''),
        distinctUntilChanged(),
        switchMap((searchText) =>
          this.getRecentlyUsedItems().pipe(
            // filtering of recently used items wrt searchText is taken care in service method
            this.utilityService.searchArrayStream(searchText)
          )
        ),
        shareReplay(1)
      );
    } else {
      const initial: VirtualSelectOption[] = [];

      if (this.nullOption && this.currentSelection) {
        initial.push({ label: 'None', value: null });
      }

      this.recentlyUsedItems$ = of([]) as Observable<VirtualSelectOption[]>;

      this.filteredOptions$ = of(
        initial.concat(
          this.options.map((option) => {
            option.selected = isEqual(option.value, this.currentSelection);
            return option;
          })
        )
      );
    }

    this.setSelectableOptions();

    this.cdr.detectChanges();
  }

  onDoneClick(): void {
    this.modalController.dismiss();
  }

  onElementSelect(option: VirtualSelectOption): void {
    if (this.cacheName && option.value) {
      option.custom = !this.options.some((internalOption) => internalOption.value !== option.value);
      this.recentLocalStorageItemsService.post(this.cacheName, option, 'label');
    }
    this.modalController.dismiss(option);
  }

  saveToCacheAndUse(): void {
    const option: VirtualSelectOption = {
      label: this.searchBarRef.nativeElement.value,
      value: this.searchBarRef.nativeElement.value,
      selected: false,
    };
    this.onElementSelect(option);
  }
}
