import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'humanizeCurrency'
})
export class HumanizeCurrencyPipe implements PipeTransform {

  // transform(amount: number, ...args: unknown[]): unknown {
  //   return null;
  // }

  transform(value: number, exponent?: number): number {
    return Math.pow(value, isNaN(exponent) ? 1 : exponent);
  }

}
