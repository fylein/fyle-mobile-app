import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecentCurrencyService {

  constructor() { }

  get() {
    const recentCurrencies = recentCurrencyCache.get('recent-currencies');

    if (!recentCurrencies) {
      recentCurrencies = [];
    }

    return recentCurrencies;
  }
}
