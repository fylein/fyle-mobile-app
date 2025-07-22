import { Component, ViewChild, ElementRef, AfterViewInit, Input, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { from, fromEvent, Observable, of } from 'rxjs';
import { map, startWith, distinctUntilChanged, switchMap, shareReplay } from 'rxjs/operators';
import { ModalController, IonicModule } from '@ionic/angular';
import { isEqual } from 'lodash';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { ExtendedOption, ModalOption, Option } from './fy-select-modal.interface';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { FyZeroStateComponent } from '../../fy-zero-state/fy-zero-state.component';
import { MatRipple } from '@angular/material/core';
import { FyHighlightTextComponent } from '../../fy-highlight-text/fy-highlight-text.component';
import { NgTemplateOutlet, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-fy-select-modal',
  templateUrl: './fy-select-modal.component.html',
  styleUrls: ['./fy-select-modal.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    MatIcon,
    MatFormField,
    MatPrefix,
    MatInput,
    FormsModule,
    MatIconButton,
    MatSuffix,
    FyZeroStateComponent,
    MatRipple,
    FyHighlightTextComponent,
    NgTemplateOutlet,
    AsyncPipe,
    TranslocoPipe,
  ],
})
export class FySelectModalComponent implements AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;

  @Input() options: Option[] = [];

  @Input() currentSelection: string | ModalOption;

  @Input() filteredOptions$: Observable<Option[]>;

  @Input() selectionElement: TemplateRef<ElementRef>;

  @Input() nullOption = true;

  @Input() cacheName: string;

  @Input() customInput = false;

  @Input() enableSearch: boolean;

  @Input() selectModalHeader = '';

  @Input() showSaveButton = false;

  @Input() placeholder: string;

  @Input() defaultLabelProp: string;

  @Input() recentlyUsed: Option[];

  @Input() label: string;

  @Input() isCustomSelect = false;

  value: string | ModalOption = '';

  recentrecentlyUsedItems$: Observable<ExtendedOption[]>;

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService,
    private utilityService: UtilityService,
    private translocoService: TranslocoService
  ) {}

  clearValue(): void {
    this.value = '';
    const searchInput = this.searchBarRef.nativeElement as HTMLInputElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  getRecentlyUsedItems(): Observable<Option[]> {
    // Check if recently items exists from api and set, else, set the recent items from the localStorage
    if (this.recentlyUsed) {
      return of(this.recentlyUsed);
    } else {
      return from(this.recentLocalStorageItemsService.get(this.cacheName)).pipe(
        map((options: ExtendedOption[]) =>
          options
            .filter(
              (option: ExtendedOption) => option.custom || this.options.map((op) => op.label).includes(option.label)
            )
            .map((option: ExtendedOption) => {
              option.selected = isEqual(option.value, this.currentSelection);
              return option;
            })
        )
      );
    }
  }

  ngAfterViewInit(): void {
    if (this.searchBarRef && this.searchBarRef.nativeElement) {
      this.filteredOptions$ = fromEvent(this.searchBarRef.nativeElement as HTMLElement, 'keyup').pipe(
        map((event: Event) => (event.target as HTMLInputElement).value),
        startWith(''),
        distinctUntilChanged(),
        map((searchText) => {
          const initial: Option[] = [];

          if (this.nullOption && this.currentSelection) {
            initial.push({ label: this.translocoService.translate('fySelectModal.none'), value: null });
          }

          if (this.customInput) {
            initial.push({ label: searchText, value: searchText, selected: false });
          }
          let extraOption = [];
          if (this.currentSelection && this.defaultLabelProp) {
            const selectedOption = this.options.find((option) => isEqual(option.value, this.currentSelection));
            if (!selectedOption) {
              extraOption = extraOption.concat({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
              .sort((a, b) => (this.isCustomSelect ? (a.selected === b.selected ? 0 : a.selected ? -1 : 1) : 0))
              .slice(0, this.isCustomSelect ? 200 : this.options.length)
          );
        }),
        shareReplay(1)
      );
      this.recentrecentlyUsedItems$ = fromEvent(this.searchBarRef.nativeElement as HTMLElement, 'keyup').pipe(
        map((event: Event) => (event.target as HTMLInputElement).value),
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
      const initial: Option[] = [];

      if (this.nullOption && this.currentSelection) {
        initial.push({ label: this.translocoService.translate('fySelectModal.none'), value: null });
      }

      this.filteredOptions$ = of(
        initial.concat(
          this.options
            .map((option) => {
              option.selected = isEqual(option.value, this.currentSelection);
              return option;
            })
            .sort((a, b) => (this.isCustomSelect ? (a.selected === b.selected ? 0 : a.selected ? -1 : 1) : 0))
            .slice(0, this.isCustomSelect ? 200 : this.options.length)
        )
      );
    }

    this.cdr.detectChanges();
  }

  onDoneClick(): void {
    this.modalController.dismiss();
  }

  onElementSelect(option: ExtendedOption): void {
    if (this.cacheName && option.value) {
      option.custom = !this.options.some((internalOption) => internalOption.value !== option.value);
      this.recentLocalStorageItemsService.post(this.cacheName, option, 'label');
    }
    this.modalController.dismiss(option);
  }

  saveToCacheAndUse(): void {
    const option: ExtendedOption = {
      label: (this.searchBarRef.nativeElement as HTMLInputElement).value,
      value: (this.searchBarRef.nativeElement as HTMLInputElement).value,
      selected: false,
    };
    this.onElementSelect(option);
  }
}
