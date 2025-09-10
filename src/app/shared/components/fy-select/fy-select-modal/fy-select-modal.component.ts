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
import { from, fromEvent, Observable, of } from 'rxjs';
import { map, startWith, distinctUntilChanged, switchMap, shareReplay } from 'rxjs/operators';
import { ModalController, IonicModule } from '@ionic/angular';
import { isEqual } from 'lodash';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { ExtendedOption, ModalOption, Option } from './fy-select-modal.interface';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatPrefix, MatInput, MatSuffix } from '@angular/material/input';
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
  private modalController = inject(ModalController);

  private cdr = inject(ChangeDetectorRef);

  private recentLocalStorageItemsService = inject(RecentLocalStorageItemsService);

  private utilityService = inject(UtilityService);

  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild('searchBar') searchBarRef: ElementRef;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() options: Option[] = [];

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() currentSelection: string | ModalOption;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() filteredOptions$: Observable<Option[]>;

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
  @Input() customInput = false;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() enableSearch: boolean;

  readonly selectModalHeader = input('');

  readonly showSaveButton = input(false);

  readonly placeholder = input<string>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() defaultLabelProp: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() recentlyUsed: Option[];

  readonly label = input<string>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() isCustomSelect = false;

  value: string | ModalOption = '';

  recentrecentlyUsedItems$: Observable<ExtendedOption[]>;

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
              (option: ExtendedOption) => option.custom || this.options.map((op) => op.label).includes(option.label),
            )
            .map((option: ExtendedOption) => {
              option.selected = isEqual(option.value, this.currentSelection);
              return option;
            }),
        ),
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
              .slice(0, this.isCustomSelect ? 200 : this.options.length),
          );
        }),
        shareReplay(1),
      );
      this.recentrecentlyUsedItems$ = fromEvent(this.searchBarRef.nativeElement as HTMLElement, 'keyup').pipe(
        map((event: Event) => (event.target as HTMLInputElement).value),
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
            .slice(0, this.isCustomSelect ? 200 : this.options.length),
        ),
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
