import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { LoaderService } from 'src/app/core/services/loader.service';
import { switchMap, finalize, distinctUntilChanged } from 'rxjs/operators';
import { from } from 'rxjs';
import { CurrencyExchangeForm } from './currency-exchange-rate.model';

@Component({
  selector: 'app-fy-currency-exchange-rate',
  templateUrl: './fy-currency-exchange-rate.component.html',
  styleUrls: ['./fy-currency-exchange-rate.component.scss'],
  standalone: false,
})
export class FyCurrencyExchangeRateComponent implements OnInit {
  @Input() amount!: number;

  @Input() currentCurrency!: string;

  @Input() newCurrency!: string;

  @Input() txnDt!: Date;

  @Input() exchangeRate?: number;

  fg: FormGroup<{
    newCurrencyAmount: FormControl<number>;
    exchangeRate: FormControl<number>;
    homeCurrencyAmount: FormControl<number>;
  }>;

  constructor(
    private modalController: ModalController,
    private currencyService: CurrencyService,
    private formBuilder: FormBuilder,
    private loaderService: LoaderService,
  ) {}

  toFixed(num: number, fixed: number): string {
    const re = new RegExp('^-?\\d+(?:.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)?.[0] || '0';
  }

  ngOnInit(): void {
    this.fg = this.formBuilder.group({
      newCurrencyAmount: new FormControl<number>(null, Validators.compose([Validators.required])),
      exchangeRate: new FormControl<number>(null, Validators.compose([Validators.required])),
      homeCurrencyAmount: new FormControl<number>(null, Validators.compose([Validators.required])),
    });

    if (this.exchangeRate) {
      this.fg.setValue({
        newCurrencyAmount: this.amount,
        exchangeRate: +this.toFixed(this.exchangeRate, 7),
        homeCurrencyAmount: +this.currencyService.getAmountWithCurrencyFraction(
          this.exchangeRate * this.amount,
          this.currentCurrency,
        ),
      });
    } else {
      from(this.loaderService.showLoader())
        .pipe(
          switchMap(() =>
            this.currencyService.getExchangeRate(this.newCurrency, this.currentCurrency, this.txnDt || new Date()),
          ),
          finalize(() => from(this.loaderService.hideLoader())),
        )
        .subscribe((exchangeRate) => {
          this.fg.setValue({
            newCurrencyAmount: this.amount,
            exchangeRate,
            homeCurrencyAmount: +this.currencyService.getAmountWithCurrencyFraction(
              exchangeRate * this.amount,
              this.currentCurrency,
            ),
          });
        });
    }

    this.fg.controls.newCurrencyAmount.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      const amount = +this.fg.controls.newCurrencyAmount.value * +this.fg.controls.exchangeRate.value;
      if (amount && amount !== Infinity) {
        const formattedAmount = this.currencyService.getAmountWithCurrencyFraction(amount, this.currentCurrency);
        this.fg.controls.homeCurrencyAmount.setValue(+formattedAmount, {
          emitEvent: false,
        });
      } else {
        this.fg.controls.homeCurrencyAmount.setValue(0, {
          emitEvent: false,
        });
      }
    });

    this.fg.controls.exchangeRate.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      const amount = +this.fg.controls.newCurrencyAmount.value * +this.fg.controls.exchangeRate.value;
      if (amount && amount !== Infinity) {
        const formattedAmount = this.currencyService.getAmountWithCurrencyFraction(amount, this.currentCurrency);
        this.fg.controls.homeCurrencyAmount.setValue(+formattedAmount, {
          emitEvent: false,
        });
      } else {
        this.fg.controls.homeCurrencyAmount.setValue(0, {
          emitEvent: false,
        });
      }
    });

    this.fg.controls.homeCurrencyAmount.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      if (this.fg.controls.newCurrencyAmount.value && this.fg.controls.homeCurrencyAmount.value) {
        this.fg.controls.exchangeRate.setValue(
          +this.toFixed(+this.fg.controls.homeCurrencyAmount.value / +this.fg.controls.newCurrencyAmount.value, 7),
          {
            emitEvent: false,
          },
        );
      }
    });
  }

  save(): void {
    const formValue = this.fg.value as CurrencyExchangeForm;
    this.modalController.dismiss({
      amount: +formValue.newCurrencyAmount,
      homeCurrencyAmount: +formValue.homeCurrencyAmount,
    });
  }

  onDoneClick(): void {
    const formValue = this.fg.value as CurrencyExchangeForm;
    this.modalController.dismiss({
      amount: +formValue.newCurrencyAmount,
      homeCurrencyAmount: +formValue.homeCurrencyAmount,
    });
  }
}
