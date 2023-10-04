import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { EventEmitter, Injector, Output } from '@angular/core';
import { Subscription, noop } from 'rxjs';
import { FormGroup, ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormControl } from '@angular/forms';

type Option = Partial<{
  label: string;
  value: string;
}>;

type OptionsData = Partial<{
  options: Option[];
  areSameValues: boolean;
  name: string;
  value: string;
}>;

@Component({
  selector: 'app-category-dependent-fields-form',
  templateUrl: './category-dependent-fields-form.component.html',
  styleUrls: ['./category-dependent-fields-form.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: CategoryDependentFieldsFormComponent, multi: true }],
})
export class CategoryDependentFieldsFormComponent implements OnInit, ControlValueAccessor, OnDestroy {
  @Output() fieldsTouched = new EventEmitter<string[]>();

  @Input() location1OptionsData: OptionsData;

  @Input() location2OptionsData: OptionsData;

  @Input() onwardDateOptionsData: OptionsData;

  @Input() returnDateOptionsData: OptionsData;

  @Input() flightJourneyTravelClassOptionsData: OptionsData;

  @Input() flightReturnTravelClassOptionsData: OptionsData;

  @Input() trainTravelClassOptionsData: OptionsData;

  @Input() busTravelClassOptionsData: OptionsData;

  @Input() distanceOptionsData: OptionsData;

  @Input() distanceUnitOptionsData: OptionsData;

  @Input() disableFormElements: boolean;

  categoryDependentFormGroup: FormGroup;

  onChangeSub: Subscription;

  onTouched: () => void = noop;

  constructor(private formBuilder: FormBuilder, private injector: Injector) {}

  isFieldTouched = (fieldName: string): boolean => this.categoryDependentFormGroup.get(fieldName).touched;

  ngOnInit(): void {
    this.categoryDependentFormGroup = this.formBuilder.group({
      location_1: [],
      location_2: [],
      from_dt: [],
      to_dt: [],
      flight_journey_travel_class: [],
      flight_return_travel_class: [],
      train_travel_class: [],
      bus_travel_class: [],
      distance: [],
      distance_unit: [],
    });

    this.categoryDependentFormGroup.valueChanges.subscribe((formControlNames: FormControl[]) => {
      const touchedItems: string[] = [];
      Object.keys(formControlNames).forEach((key) => {
        if (this.isFieldTouched(key)) {
          touchedItems.push(key);
        }
      });
      this.fieldsTouched.emit(touchedItems);
    });
  }

  ngOnDestroy(): void {
    this.onChangeSub?.unsubscribe();
  }

  writeValue(value: FormGroup): void {
    if (value) {
      this.categoryDependentFormGroup.patchValue(value);
    }
  }

  registerOnChange(onChange: () => void): void {
    this.onChangeSub = this.categoryDependentFormGroup.valueChanges.subscribe(onChange);
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }
}
