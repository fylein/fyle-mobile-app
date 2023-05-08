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
import { from, fromEvent, Observable, of } from 'rxjs';
import { map, startWith, distinctUntilChanged, tap, switchMap, shareReplay } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { isEqual, includes } from 'lodash';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { UtilityService } from 'src/app/core/services/utility.service';

@Component({
  selector: 'app-fy-select-modal',
  templateUrl: './fy-select-modal.component.html',
  styleUrls: ['./fy-select-modal.component.scss'],
})
export class FySelectModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;

  @Input() options: { label: string; value: any; selected?: boolean }[] = [];

  @Input() currentSelection: any;

  @Input() filteredOptions$: Observable<{ label: string; value: any; selected?: boolean }[]>;

  @Input() selectionElement: TemplateRef<ElementRef>;

  @Input() nullOption = true;

  @Input() cacheName;

  @Input() customInput = false;

  @Input() enableSearch;

  @Input() selectModalHeader = '';

  @Input() showSaveButton = false;

  @Input() placeholder: string;

  @Input() defaultLabelProp;

  @Input() recentlyUsed: { label: string; value: any; selected?: boolean }[];

  @Input() label;

  value: string | object = '';

  recentrecentlyUsedItems$: Observable<any[]>;

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

          if (this.customInput) {
            initial.push({ label: searchText, value: searchText, selected: false });
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
        }),
        shareReplay(1)
      );
      this.recentrecentlyUsedItems$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
        map((event: any) => event.srcElement.value),
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
      const initial = [];

      if (this.nullOption && this.currentSelection) {
        initial.push({ label: 'None', value: null });
      }

      this.filteredOptions$ = of(
        initial.concat(
          this.options.map((option) => {
            option.selected = isEqual(option.value, this.currentSelection);
            return option;
          })
        )
      );
    }

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
