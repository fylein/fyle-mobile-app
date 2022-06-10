import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataTransformService {
  constructor() {}

  unflatten(data): any {
    const res = {};
    Object.keys(data).forEach((key) => {
      const idx = key.indexOf('_');
      if (idx !== -1) {
        const member = key.substring(0, idx);
        const strippedKey = key.substring(idx + 1, key.length);
        if (!res[member]) {
          res[member] = {};
        }
        res[member][strippedKey] = data[key];
      } else {
        res[key] = data[key];
      }
    });
    return res;
  }

  etxnRaw(data) {
    const res = {};
    Object.keys(data).forEach((key) => {
      Object.keys(data[key]).forEach((key1) => {
        const newKey = key + '_' + key1;
        res[newKey] = data[key][key1];
      });
    });
    return res;
  }
}
