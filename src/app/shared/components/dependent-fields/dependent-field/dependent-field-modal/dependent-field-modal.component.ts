import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  ChangeDetectorRef,
  inject,
  input,
} from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map, startWith, distinctUntilChanged, switchMap, finalize } from 'rxjs/operators';
import { ModalController } from '@ionic/angular/standalone';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { DependentFieldOption } from 'src/app/core/models/dependent-field-option.model';
import { cloneDeep } from 'lodash';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatPrefix, MatInput, MatSuffix } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { FyZeroStateComponent } from '../../../fy-zero-state/fy-zero-state.component';
import { MatRipple } from '@angular/material/core';
import { FyHighlightTextComponent } from '../../../fy-highlight-text/fy-highlight-text.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-dependent-field-modal',
  templateUrl: './dependent-field-modal.component.html',
  styleUrls: ['./dependent-field-modal.component.scss'],
  imports: [
    IonicModule,
    MatIcon,
    MatFormField,
    MatPrefix,
    MatInput,
    FormsModule,
    MatSuffix,
    MatIconButton,
    FyZeroStateComponent,
    MatRipple,
    FyHighlightTextComponent,
    AsyncPipe,
    TranslocoPipe,
  ],
})
export class DependentFieldModalComponent implements AfterViewInit {
  private modalController = inject(ModalController);

  private dependentFieldsService = inject(DependentFieldsService);

  private cdr = inject(ChangeDetectorRef);

  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild('searchBar') searchBarRef: ElementRef<HTMLInputElement>;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() currentSelection: string;

  readonly placeholder = input<string>(undefined);

  readonly label = input<string>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() fieldId: number;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() parentFieldId: number;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() parentFieldValue: string;

  filteredOptions$: Observable<DependentFieldOption[]>;

  value: string;

  isLoading = false;

  getDependentFieldOptions(searchQuery: string): Observable<DependentFieldOption[]> {
    this.isLoading = true;
    this.cdr.detectChanges();
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
          })),
        ),
        map((dependentFieldOptions) => this.getFinalDependentFieldValues(dependentFieldOptions, this.currentSelection)),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      );
  }

  clearValue(): void {
    this.value = '';
    const searchInput = this.searchBarRef.nativeElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  ngAfterViewInit(): void {
    this.filteredOptions$ = fromEvent<{ srcElement: { value: string } }>(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchString: string) => {
        this.cdr.detectChanges();
        return this.getDependentFieldOptions(searchString);
      }),
    );
    this.cdr.detectChanges();
  }

  onDoneClick(): void {
    this.modalController.dismiss();
  }

  onElementSelect(option: DependentFieldOption): void {
    this.modalController.dismiss(option);
  }

  getFinalDependentFieldValues(
    dependentFieldOptions: DependentFieldOption[],
    currentSelection: string,
  ): DependentFieldOption[] {
    const nullOption = {
      label: this.translocoService.translate('dependentFieldModal.none'),
      value: null,
      selected: currentSelection === null,
    };

    if (!currentSelection) {
      return [nullOption, ...dependentFieldOptions];
    }

    const dependentFieldOptionsCopy = cloneDeep(dependentFieldOptions);
    let selectedOption = dependentFieldOptionsCopy.find(
      (dependentFieldOption) => dependentFieldOption.value === currentSelection,
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
