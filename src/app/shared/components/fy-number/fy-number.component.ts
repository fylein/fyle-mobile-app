import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Platform } from '@ionic/angular';
import { noop } from 'rxjs';

@Component({
  selector: 'app-fy-number',
  templateUrl: './fy-number.component.html',
  styleUrls: ['./fy-number.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FyNumberComponent),
      multi: true,
    },
  ],
})
export class FyNumberComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() placeholder: string;

  @Input() disabled: boolean;

  @Input() min: number;

  isDisabled = false;

  fc: FormControl;

  isIos = false;

  private innerValue;

  private onTouchedCallback: () => void = noop;

  private onChangeCallback: (_: any) => void = noop;

  constructor(private platform: Platform) {}

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChangeCallback(v);
    }
  }

  writeValue(value: any): void {
    if (value !== this.innerValue) {
      this.innerValue = value && parseFloat(value);
      this.fc.setValue(value && parseFloat(value));
    }
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onBlur() {
    this.onTouchedCallback();
  }

  ngOnDestroy(): void {}

  ngOnInit() {
    this.isIos = this.platform.is('ios');
    this.fc = new FormControl();
    this.fc.valueChanges.subscribe((value) => {
      if (typeof value === 'string') {
        this.value = value && parseFloat(value);
      } else if (typeof value === 'number') {
        this.value = value;
      } else {
        this.value = null;
      }
    });
  }
}
