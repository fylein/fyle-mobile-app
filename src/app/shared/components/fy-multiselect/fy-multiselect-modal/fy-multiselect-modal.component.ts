import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatLegacyChipInputEvent as MatChipInputEvent } from '@angular/material/legacy-chips';

@Component({
  selector: 'app-fy-multiselect-modal',
  templateUrl: './fy-multiselect-modal.component.html',
  styleUrls: ['./fy-multiselect-modal.component.scss'],
})
export class FyMultiselectModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;

  @Input() options: { label: string; value: any; selected?: boolean }[] = [];

  @Input() currentSelections: any[] = [];

  @Input() filteredOptions$: Observable<{ label: string; value: any; selected?: boolean }[]>;

  @Input() selectModalHeader = 'Select Items';

  @Input() subheader = 'All Items';

  value;

  selectable = true;

  removable = true;

  addOnBlur = true;

  readonly separatorKeysCodes = this.getSeparatorKeysCodes();

  constructor(private modalController: ModalController, private cdr: ChangeDetectorRef) {}

  clearValue() {
    this.value = '';
    const searchInput = this.searchBarRef.nativeElement as HTMLInputElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  getSeparatorKeysCodes() {
    return [ENTER, COMMA];
  }

  addChip(event: MatChipInputEvent) {
    if (event && event.chipInput) {
      event.chipInput.clear();
    }
  }

  removeChip(item) {
    const updatedItem = {
      label: item,
      selected: false,
      value: item,
    };
    this.onElementSelected(updatedItem);
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.filteredOptions$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      map((searchText) =>
        this.options
          .filter((option) => option.label.toLowerCase().includes(searchText.toLowerCase()))
          .map((option) => {
            if (this.currentSelections) {
              option.selected = this.currentSelections.includes(option.value);
            }
            return option;
          })
      )
    );
    this.cdr.detectChanges();
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  onElementSelected(selectedOption) {
    this.options = this.options.map((option) => {
      if (isEqual(option.value, selectedOption.value)) {
        option.selected = selectedOption.selected;
      }
      return option;
    });

    this.currentSelections = this.options.filter((option) => option.selected).map((option) => option.value);
  }

  useSelected() {
    this.modalController.dismiss({
      selected: this.options.filter((option) => option.selected),
    });
  }
}
