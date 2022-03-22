import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

type Option = Partial<{ label: string; value: any }>;
type OptionsData = Partial<{ options: Option[]; areSameValues: boolean }>;

@Component({
  selector: 'app-category-dependent-fields-form',
  templateUrl: './category-dependent-fields-form.component.html',
  styleUrls: ['./category-dependent-fields-form.component.scss'],
})
export class CategoryDependentFieldsFormComponent implements OnInit {
  @Input() categoryDependentFormGroup: FormGroup;

  @Input() location1OptionsData$: Observable<OptionsData>;

  @Input() location2OptionsData$: Observable<OptionsData>;

  @Input() onwardDateOptionsData$: Observable<OptionsData>;

  @Input() returnDateOptionsData$: Observable<OptionsData>;

  @Input() flightJourneyTravelClassOptionsData$: Observable<OptionsData>;

  @Input() flightReturnTravelClassOptionsData$: Observable<OptionsData>;

  @Input() trainTravelClassOptionsData$: Observable<OptionsData>;

  @Input() busTravelClassOptionsData$: Observable<OptionsData>;

  @Input() distanceOptionsData$: Observable<OptionsData>;

  @Input() distanceUnitOptionsData$: Observable<OptionsData>;

  @Input() disableFormElements: boolean;

  constructor() {}

  ngOnInit() {}
}
