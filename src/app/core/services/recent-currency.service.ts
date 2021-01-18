import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecentCurrencyService {

  constructor() { }

  indexOfCurrency(currencyArray, currency) {
    for (let i = 0, len = currencyArray.length; i < len; i++) {
      if (currencyArray[i].id === currency.id) {
        return i;
      }
    }

    return -1;
  }

  get() {
    const recentCurrencies = recentCurrencyCache.get('recent-currencies');

    if (!recentCurrencies) {
      recentCurrencies = [];
    }

    return recentCurrencies;
  }

  post(currency) {
    let recentCurrencies = this.get();
    let maxArrayLength = 3;

    // 1. Find the index of the currency
    let i = this.indexOfCurrency(recentCurrencies, currency);

    if (i > -1) { // 2. If found in the array
      // a. remove the object
      recentCurrencies.splice(i, 1);
      // b. put it as first item
      recentCurrencies.unshift(currency);
    } else { // 3. If not found in the array
      // a. check if array is full (5)
      if (recentCurrencies.length >= maxArrayLength) {
        // b. yes - remove last item
        recentCurrencies.pop();
      }
      // c. add to first item
      recentCurrencies.unshift(currency);
    }

    recentCurrencyCache.put('recent-currencies', recentCurrencies);

    return recentCurrencies;
  }
}
