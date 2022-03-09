import { Component, OnInit, forwardRef, Input, Injector, OnDestroy } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NgControl } from '@angular/forms';
import { noop } from 'rxjs';

@Component({
  selector: 'app-fy-select-vehicle',
  templateUrl: './fy-select-vehicle.component.html',
  styleUrls: ['./fy-select-vehicle.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FySelectVehicleComponent),
      multi: true,
    },
  ],
})
export class FySelectVehicleComponent implements OnInit, ControlValueAccessor {
  @Input() mandatory = false;

  @Input() label = 'Type';

  @Input() isAmountDisabled = false;

  @Input() mileageConfig;

  private ngControl: NgControl;

  private innerValue;

  private onTouchedCallback: () => void = noop;

  private onChangeCallback: (_: any) => void = noop;

  constructor(private injector: Injector) {}

  get valid() {
    if (this.ngControl.touched) {
      return this.ngControl.valid;
    } else {
      return true;
    }
  }

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;

      this.onChangeCallback(v);
    }
  }

  ngOnInit() {
    this.ngControl = this.injector.get(NgControl);
  }

  onBlur() {
    this.onTouchedCallback();
  }

  writeValue(value: any): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
    }
  }

  selectType(value: string) {
    this.value = value;
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
}
