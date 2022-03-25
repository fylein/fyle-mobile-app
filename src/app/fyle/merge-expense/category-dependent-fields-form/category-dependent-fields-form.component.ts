import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { EventEmitter, Injector, Output, TemplateRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  FormControl,
  FormGroup,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormBuilder,
  Validators,
  NgControl,
} from '@angular/forms';

type Option = Partial<{
  label: string;
  value: any;
}>;

type OptionsData = Partial<{
  options: Option[];
  areSameValues: boolean;
  name: string;
  value: any;
}>;

@Component({
  selector: 'app-category-dependent-fields-form',
  templateUrl: './category-dependent-fields-form.component.html',
  styleUrls: ['./category-dependent-fields-form.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: CategoryDependentFieldsFormComponent, multi: true }],
})
export class CategoryDependentFieldsFormComponent implements OnInit, ControlValueAccessor, OnDestroy {
  @Output() fieldsTouched = new EventEmitter<string[]>();

  @Input() location1OptionsData: Observable<OptionsData>;

  @Input() location2OptionsData: Observable<OptionsData>;

  @Input() onwardDateOptionsData: Observable<OptionsData>;

  @Input() returnDateOptionsData: Observable<OptionsData>;

  @Input() flightJourneyTravelClassOptionsData: Observable<OptionsData>;

  @Input() flightReturnTravelClassOptionsData: Observable<OptionsData>;

  @Input() trainTravelClassOptionsData: Observable<OptionsData>;

  @Input() busTravelClassOptionsData: Observable<OptionsData>;

  @Input() distanceOptionsData: Observable<OptionsData>;

  @Input() distanceUnitOptionsData: Observable<OptionsData>;

  @Input() disableFormElements: boolean;

  categoryDependentFormGroup: FormGroup;

  onChangeSub: Subscription;

  private ngControl: NgControl;

  constructor(private formBuilder: FormBuilder, private injector: Injector) {}

  ngOnInit() {
    this.ngControl = this.injector.get(NgControl);

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

    this.categoryDependentFormGroup.valueChanges.subscribe((formControlNames) => {
      const touchedItems = [];
      Object.keys(formControlNames).forEach((key) => {
        if (this.categoryDependentFormGroup.get(key).touched) {
          touchedItems.push(key);
        }
      });
      this.fieldsTouched.emit(touchedItems);
    });
  }

  onTouched = () => {};

  ngOnDestroy(): void {
    this.onChangeSub.unsubscribe();
  }

  writeValue(value: any) {
    if (value) {
      this.categoryDependentFormGroup.patchValue(value);
    }
  }

  registerOnChange(onChange): void {
    this.onChangeSub = this.categoryDependentFormGroup.valueChanges.subscribe(onChange);
  }

  registerOnTouched(onTouched): void {
    this.onTouched = onTouched;
  }
}
