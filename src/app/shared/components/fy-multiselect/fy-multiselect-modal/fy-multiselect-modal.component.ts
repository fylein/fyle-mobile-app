import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-fy-multiselect-modal',
  templateUrl: './fy-multiselect-modal.component.html',
  styleUrls: ['./fy-multiselect-modal.component.scss'],
  standalone: false,
})
export class FyMultiselectModalComponent implements AfterViewInit {
  private modalController = inject(ModalController);

  private cdr = inject(ChangeDetectorRef);

  readonly searchBarRef = viewChild<ElementRef<HTMLInputElement>>('searchBar');

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() options: { label: string; value: unknown; selected?: boolean }[] = [];

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() currentSelections: unknown[] = [];

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() filteredOptions$: Observable<{ label: string; value: unknown; selected?: boolean }[]>;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() selectModalHeader: string;

  readonly subheader = input<string>(undefined);

  value = '';

  addOnBlur = true;

  readonly separatorKeysCodes = this.getSeparatorKeysCodes();

  clearValue(): void {
    this.value = '';
    const searchInput = this.searchBarRef().nativeElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  getSeparatorKeysCodes(): number[] {
    return [ENTER, COMMA];
  }

  addChip(event: MatChipInputEvent): void {
    if (event && event.chipInput) {
      event.chipInput.clear();
    }
  }

  removeChip(item: unknown): void {
    const updatedItem: { label: string; value: unknown; selected: boolean } = {
      label: String(item),
      selected: false,
      value: item,
    };
    this.onElementSelected(updatedItem);
  }

  ngAfterViewInit(): void {
    this.filteredOptions$ = fromEvent<Event>(this.searchBarRef().nativeElement, 'keyup').pipe(
      map((event: Event) => (event.target as HTMLInputElement).value),
      startWith(''),
      distinctUntilChanged(),
      map((searchText: string) =>
        this.options
          .filter((option) => option.label.toLowerCase().includes(searchText.toLowerCase()))
          .map((option) => {
            if (this.currentSelections) {
              option.selected = this.currentSelections.some((selection) => isEqual(option.value, selection));
            }
            return option;
          }),
      ),
    );
    this.cdr.detectChanges();
  }

  onDoneClick(): void {
    this.modalController.dismiss();
  }

  onElementSelected(selectedOption: { label: string; value: unknown; selected?: boolean }): void {
    this.options = this.options.map((option) => {
      if (isEqual(option.value, selectedOption.value)) {
        option.selected = selectedOption.selected;
      }
      return option;
    });

    this.currentSelections = this.options.filter((option) => option.selected).map((option) => option.value);
  }

  useSelected(): void {
    this.modalController.dismiss({
      selected: this.options.filter((option) => option.selected),
    });
  }
}
