import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  ChangeDetectorRef,
  TemplateRef,
  inject,
  input,
} from '@angular/core';
import { combineLatest, from, fromEvent, Observable, of } from 'rxjs';
import { map, startWith, distinctUntilChanged, switchMap, shareReplay } from 'rxjs/operators';
import { ModalController, IonicModule } from '@ionic/angular';
import { cloneDeep, isEqual } from 'lodash';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { VirtualSelectOption } from './virtual-select-option.interface';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatPrefix, MatInput, MatSuffix } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf } from '@angular/cdk/scrolling';
import { FyZeroStateComponent } from '../../fy-zero-state/fy-zero-state.component';
import { MatRipple } from '@angular/material/core';
import { FyHighlightTextComponent } from '../../fy-highlight-text/fy-highlight-text.component';
import { NgTemplateOutlet } from '@angular/common';
@Component({
  selector: 'app-virtual-select-modal',
  templateUrl: './virtual-select-modal.component.html',
  styleUrls: ['./virtual-select-modal.component.scss'],
  imports: [
    IonicModule,
    MatIcon,
    MatFormField,
    MatPrefix,
    MatInput,
    FormsModule,
    MatIconButton,
    MatSuffix,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    FyZeroStateComponent,
    CdkVirtualForOf,
    MatRipple,
    FyHighlightTextComponent,
    NgTemplateOutlet,
    TranslocoPipe,
  ],
})
export class VirtualSelectModalComponent implements AfterViewInit {
  private modalController = inject(ModalController);

  private cdr = inject(ChangeDetectorRef);

  private recentLocalStorageItemsService = inject(RecentLocalStorageItemsService);

  private utilityService = inject(UtilityService);

  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild('searchBar') searchBarRef: ElementRef<HTMLInputElement>;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() options: VirtualSelectOption[] = [];

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() currentSelection: VirtualSelectOption;

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() selectionElement: TemplateRef<ElementRef>;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() nullOption = true;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() cacheName: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() enableSearch;

  readonly selectModalHeader = input('');

  readonly placeholder = input<string>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() defaultLabelProp: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() recentlyUsed: VirtualSelectOption[];

  readonly label = input(undefined);

  value = '';

  recentlyUsedItems$: Observable<VirtualSelectOption[]>;

  filteredOptions$: Observable<VirtualSelectOption[]>;

  selectableOptions: VirtualSelectOption[] = [];

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
            }),
        ),
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
      initial.push({ label: this.translocoService.translate('virtualSelectModal.noneOption'), value: null });
    }

    let extraOption: VirtualSelectOption[] = [];
    if (this.currentSelection && this.defaultLabelProp) {
      const selectedOption: VirtualSelectOption = this.options.find((option) =>
        isEqual(option.value, this.currentSelection),
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
        }),
    );
  }

  ngAfterViewInit(): void {
    if (this.searchBarRef && this.searchBarRef.nativeElement) {
      this.filteredOptions$ = fromEvent<{ target: HTMLInputElement }>(this.searchBarRef.nativeElement, 'keyup').pipe(
        map((event) => event.target.value),
        startWith(''),
        distinctUntilChanged(),
        map((searchText: string) => this.setFilteredOptions(searchText)),
        shareReplay(1),
      );
      this.recentlyUsedItems$ = fromEvent<{ target: HTMLInputElement }>(this.searchBarRef.nativeElement, 'keyup').pipe(
        map((event) => event.target.value),
        startWith(''),
        distinctUntilChanged(),
        switchMap((searchText) =>
          this.getRecentlyUsedItems().pipe(
            // filtering of recently used items wrt searchText is taken care in service method
            this.utilityService.searchArrayStream(searchText),
          ),
        ),
        shareReplay(1),
      );
    } else {
      const initial: VirtualSelectOption[] = [];

      if (this.nullOption && this.currentSelection) {
        initial.push({ label: this.translocoService.translate('virtualSelectModal.noneOption'), value: null });
      }

      this.recentlyUsedItems$ = of([]) as Observable<VirtualSelectOption[]>;

      this.filteredOptions$ = of(
        initial.concat(
          this.options.map((option) => {
            option.selected = isEqual(option.value, this.currentSelection);
            return option;
          }),
        ),
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
