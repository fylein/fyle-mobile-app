import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map, startWith, distinctUntilChanged, switchMap, finalize } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';

interface DependentFieldOption {
  label: string;
  value: string;
  selected: boolean;
}

@Component({
  selector: 'app-dependent-field-modal',
  templateUrl: './dependent-field-modal.component.html',
  styleUrls: ['./dependent-field-modal.component.scss'],
})
export class DependentFieldModalComponent implements OnInit, AfterViewInit {
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

  ngOnInit() {}

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
        map((dependentFieldOptions) => {
          const nullOption = { label: 'None', value: null, selected: false };
          return [nullOption, ...dependentFieldOptions];
        }),
        finalize(() => {
          this.isLoading = false;
        })
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
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchString) => this.getDependentFieldOptions(searchString)),
      map((dependentFieldOptions: DependentFieldOption[]) =>
        dependentFieldOptions.map((dependentFieldOption) => {
          dependentFieldOption.selected = dependentFieldOption.value === this.currentSelection;
          return dependentFieldOption;
        })
      )
    );
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  onElementSelect(option: DependentFieldOption) {
    this.modalController.dismiss(option);
  }
}
