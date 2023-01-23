import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, ChangeDetectorRef } from '@angular/core';
import { fromEvent, Observable, of } from 'rxjs';
import { map, startWith, distinctUntilChanged } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { isEqual } from 'lodash';

@Component({
  selector: 'app-dependent-field-modal',
  templateUrl: './dependent-field-modal.component.html',
  styleUrls: ['./dependent-field-modal.component.scss'],
})
export class DependentFieldModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;

  @Input() options: { label: string; value: any; selected?: boolean }[] = [];

  @Input() currentSelection: any;

  @Input() showNullOption = true;

  @Input() enableSearch: boolean;

  @Input() selectModalHeader = '';

  @Input() placeholder: string;

  @Input() label: string;

  filteredOptions$: Observable<{ label: string; value: any; selected?: boolean }[]>;

  value = '';

  constructor(private modalController: ModalController, private cdr: ChangeDetectorRef) {}

  ngOnInit() {}

  clearValue() {
    this.value = '';
    const searchInput = this.searchBarRef.nativeElement as HTMLInputElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  ngAfterViewInit() {
    if (this.searchBarRef && this.searchBarRef.nativeElement) {
      this.filteredOptions$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
        map((event: any) => event.srcElement.value),
        startWith(''),
        distinctUntilChanged(),
        map((searchText) => {
          const initial = [];

          if (this.showNullOption && this.currentSelection) {
            initial.push({ label: 'None', value: null });
          }

          //Check this logic
          let extraOption = [];
          if (this.currentSelection) {
            const selectedOption = this.options.find((option) => isEqual(option.value, this.currentSelection));
            if (!selectedOption) {
              extraOption = extraOption.concat({
                label: 'Some label',
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
    } else {
      const initial = [];

      if (this.showNullOption && this.currentSelection) {
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
    this.modalController.dismiss(option);
  }
}
