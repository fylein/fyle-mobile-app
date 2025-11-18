import { AfterViewInit, Component, forwardRef, Injector, Input, OnInit, inject, input } from '@angular/core';
import {
  ControlValueAccessor,
  UntypedFormControl,
  NG_VALUE_ACCESSOR,
  NgControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Platform } from '@ionic/angular/standalone';
import { noop } from 'rxjs';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';

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
  imports: [FormsModule, ReactiveFormsModule],
})
export class FyNumberComponent implements ControlValueAccessor, OnInit, AfterViewInit {
  private platform = inject(Platform);

  private launchDarklyService = inject(LaunchDarklyService);

  private injector = inject(Injector);

  readonly placeholder = input<string>(undefined);

  readonly disabled = input<boolean>(undefined);

  readonly min = input<number>(undefined);

  readonly isAmount = input<boolean>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() isDistance = false;

  isDisabled = false;

  fc: UntypedFormControl;

  isIos = false;

  isAndroid = true;

  isKeyboardPluginEnabled = true;

  // This variable stores the input without the decimal value
  inputWithoutDecimal: string;

  // This variable tracks if comma was clicked by the user.
  commaClicked = false;

  innerValue: number;

  isNegativeExpensePluginEnabled = false;

  isAndroidNegativeExpensePluginEnabled = false;

  negativeExpense: string;

  onTouchedCallback: () => void = noop;

  onChangeCallback: (_: number) => void = noop;

  keysForNegativeExpense = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '.'];

  private control: UntypedFormControl;

  get value(): number {
    return this.innerValue;
  }

  set value(v: number) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChangeCallback(v);
    }
  }

  writeValue(value: string | number): void {
    if (value !== this.innerValue) {
      this.innerValue = value && parseFloat(value as string);
      this.fc.setValue(value && parseFloat(value as string));
      this.negativeExpense = this.fc.value as string;
    }
  }

  registerOnChange(fn: (_: number) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    // Apply disabled state if fc is already initialized, otherwise it will be applied in ngOnInit
    if (this.fc) {
      if (isDisabled) {
        this.fc.disable({ emitEvent: false });
      } else {
        this.fc.enable({ emitEvent: false });
      }
    }
  }

  onBlur(): void {
    this.onTouchedCallback();
  }

  ngOnInit(): void {
    this.isIos = this.platform.is('ios');

    this.isAndroid = this.platform.is('android');

    this.launchDarklyService
      .checkIfKeyboardPluginIsEnabled()
      .subscribe((isKeyboardPluginEnabled) => (this.isKeyboardPluginEnabled = isKeyboardPluginEnabled));

    this.launchDarklyService
      .checkIfNegativeExpensePluginIsEnabled()
      .subscribe(
        (isNegativeExpensePluginEnabled) => (this.isNegativeExpensePluginEnabled = isNegativeExpensePluginEnabled),
      );

    this.launchDarklyService
      .checkIfAndroidNegativeExpensePluginIsEnabled()
      .subscribe((isAndroidNegativeExpensePluginEnabled) => {
        this.isAndroidNegativeExpensePluginEnabled = isAndroidNegativeExpensePluginEnabled;
      });

    if (!this.isDistance) {
      // If the input is for amount, allow negative values
      this.fc = new UntypedFormControl(null, Validators.pattern(/^-?(?:\d*\.\d+|\d+\.?)$/));
    } else {
      // If the input is for distance, do not allow negative values
      this.fc = new UntypedFormControl(null, Validators.pattern(/^\d*(\.\d+)?$/));
    }

    // Apply disabled state from input or setDisabledState (which may have been called before ngOnInit)
    if (this.disabled() || this.isDisabled) {
      this.fc.disable({ emitEvent: false });
    }

    this.fc.valueChanges.subscribe((value) => {
      if (typeof value === 'string' && this.fc.valid) {
        this.value = value && parseFloat(value);
      } else if (typeof value === 'number' && this.fc.valid) {
        this.value = value;
      } else {
        this.value = null;
        // Errors are propagated to the parent component, where we can show the error message
        this.control?.setErrors({ invalid: true });
      }
    });
  }

  ngAfterViewInit(): void {
    // This is a way to get reference of parent component's form control, we can propagate errors to the parent component
    const ngControl: NgControl = this.injector.get(NgControl, null);

    this.control = ngControl.control as UntypedFormControl;
  }

  // This is a hack to handle the comma key on ios devices in regions where the decimal separator is a comma
  handleChange(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;

    if (event.code === 'Comma') {
      this.commaClicked = true;
    } else {
      // If last input was a comma, patch value with period as decimal separator
      if (this.commaClicked) {
        this.commaClicked = false;
        this.fc.patchValue(this.inputWithoutDecimal + '.' + event.key);
      }
      this.inputWithoutDecimal = inputValue;
    }
  }

  handleNegativeExpenseChange(event: KeyboardEvent): void {
    if (!this.keysForNegativeExpense.includes(event.key) && !(event.code === 'Backspace')) {
      event.preventDefault();
    }
  }
}
