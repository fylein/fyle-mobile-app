import { Component, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map, startWith, distinctUntilChanged, switchMap, finalize } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { DependentFieldOption } from 'src/app/core/models/dependent-field-option.model';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-dependent-field-modal',
  templateUrl: './dependent-field-modal.component.html',
  styleUrls: ['./dependent-field-modal.component.scss'],
})
export class DependentFieldModalComponent implements AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;

  @Input() currentSelection: string;

  @Input() placeholder: string;

  @Input() label: string;

  @Input() fieldId: number;

  @Input() parentFieldId: number;

  @Input() parentFieldValue: string;

  filteredOptions$: Observable<DependentFieldOption[]>;

  value: string;

  isLoading = false;

  constructor(private modalController: ModalController, private dependentFieldsService: DependentFieldsService) {}

  getDependentFieldOptions(searchQuery: string): Observable<DependentFieldOption[]> {
    this.isLoading = true;

    return this.dependentFieldsService
      .getOptionsForDependentField({
        fieldId: this.fieldId,
        parentFieldId: this.parentFieldId,
        parentFieldValue: this.parentFieldValue,
        searchQuery,
      })
      .pipe(
        map((dependentFieldOptions) =>
          dependentFieldOptions.map((dependentFieldOption) => ({
            label: dependentFieldOption.expense_field_value,
            value: dependentFieldOption.expense_field_value,
            selected: false,
          }))
        ),
        map((dependentFieldOptions) => this.getFinalDependentFieldValues(dependentFieldOptions, this.currentSelection)),
        finalize(() => (this.isLoading = false))
      );
  }

  clearValue() {
    this.value = '';
    const searchInput = this.searchBarRef.nativeElement as HTMLInputElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  ngAfterViewInit() {
    this.filteredOptions$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.target.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchString) => this.getDependentFieldOptions(searchString))
    );
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  onElementSelect(option: DependentFieldOption) {
    this.modalController.dismiss(option);
  }

  getFinalDependentFieldValues(dependentFieldOptions: DependentFieldOption[], currentSelection: string) {
    const nullOption = { label: 'None', value: null, selected: currentSelection === null };

    if (!currentSelection) {
      return [nullOption, ...dependentFieldOptions];
    }

    const dependentFieldOptionsCopy = cloneDeep(dependentFieldOptions);
    let selectedOption = dependentFieldOptionsCopy.find(
      (dependentFieldOption) => dependentFieldOption.value === currentSelection
    );

    if (selectedOption) {
      selectedOption.selected = true;
      return [nullOption, ...dependentFieldOptionsCopy];
    } else {
      selectedOption = {
        label: currentSelection,
        value: currentSelection,
        selected: true,
      };
      return [nullOption, selectedOption, ...dependentFieldOptions];
    }
  }
}
