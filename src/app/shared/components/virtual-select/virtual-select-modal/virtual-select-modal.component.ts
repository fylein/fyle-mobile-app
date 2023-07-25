import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  ChangeDetectorRef,
  TemplateRef,
} from '@angular/core';
import { combineLatest, from, fromEvent, Observable, of } from 'rxjs';
import { map, startWith, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { isEqual, cloneDeep } from 'lodash';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { UtilityService } from 'src/app/core/services/utility.service';

@Component({
  selector: 'app-virtual-select-modal',
  templateUrl: './virtual-select-modal.component.html',
  styleUrls: ['./virtual-select-modal.component.scss'],
})
export class VirtualSelectModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;

  @Input() options: { label: string; value: any; selected?: boolean }[] = [];

  @Input() currentSelection: any;

  @Input() selectionElement: TemplateRef<ElementRef>;

  @Input() nullOption = true;

  @Input() cacheName;

  @Input() enableSearch;

  @Input() selectModalHeader = '';

  @Input() showSaveButton = false;

  @Input() placeholder: string;

  @Input() defaultLabelProp;

  @Input() recentlyUsed: { label: string; value: any; selected?: boolean }[];

  @Input() label;

  value = '';

  recentlyUsedItems$: Observable<any[]>;

  filteredOptions$: Observable<{ label: string; value: any; selected?: boolean }[]>;

  selectableOptions: { label: string; value: any; selected?: boolean }[] = [];

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
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

  getRecentlyUsedItems() {
    // Check if recently items exists from api and set, else, set the recent items from the localStorage
    if (this.recentlyUsed) {
      return of(this.recentlyUsed);
    } else {
      return from(this.recentLocalStorageItemsService.get(this.cacheName)).pipe(
        map((options: any) =>
          options
            .filter((option) => option.custom || this.options.map((op) => op.label).includes(option.label))
            .map((option) => {
              option.selected = isEqual(option.value, this.currentSelection);
              return option;
            })
        )
      );
    }
  }

  ngAfterViewInit() {
    if (this.searchBarRef && this.searchBarRef.nativeElement) {
      this.filteredOptions$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
        map((event: any) => event.srcElement.value),
        startWith(''),
        distinctUntilChanged(),
        map((searchText) => {
          const initial = [];

          if (this.nullOption && this.currentSelection) {
            initial.push({ label: 'None', value: null });
          }

          let extraOption = [];
          if (this.currentSelection && this.defaultLabelProp) {
            const selectedOption = this.options.find((option) => isEqual(option.value, this.currentSelection));
            if (!selectedOption) {
              extraOption = extraOption.concat({
                label: this.currentSelection[this.defaultLabelProp],
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
        })
      );
      this.recentlyUsedItems$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
        map((event: any) => event.srcElement.value),
        startWith(''),
        distinctUntilChanged(),
        switchMap((searchText) =>
          this.getRecentlyUsedItems().pipe(
            // filtering of recently used items wrt searchText is taken care in service method
            this.utilityService.searchArrayStream(searchText)
          )
        )
      );
    } else {
      const initial = [];

      if (this.nullOption && this.currentSelection) {
        initial.push({ label: 'None', value: null });
      }

      this.recentlyUsedItems$ = of([]);

      this.filteredOptions$ = of(
        initial.concat(
          this.options.map((option) => {
            option.selected = isEqual(option.value, this.currentSelection);
            return option;
          })
        )
      );
    }

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

    this.cdr.detectChanges();
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  onElementSelect(option) {
    if (this.cacheName && option.value) {
      option.custom = !this.options.some((internalOption) => internalOption.value !== option.value);
      this.recentLocalStorageItemsService.post(this.cacheName, option, 'label');
    }
    this.modalController.dismiss(option);
  }

  saveToCacheAndUse() {
    const option: any = {
      label: this.searchBarRef.nativeElement.value,
      value: this.searchBarRef.nativeElement.value,
      selected: false,
    };
    this.onElementSelect(option);
  }
}
