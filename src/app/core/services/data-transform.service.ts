import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataTransformService {
  constructor() {}

  unflatten<T, K>(data: K): T {
    const res = {};
    Object.keys(data).forEach((key) => {
      const idx = key.indexOf('_');
      if (idx !== -1) {
        const member = key.substring(0, idx);
        const strippedKey = key.substring(idx + 1, key.length);
        if (!res[member]) {
          res[member] = {};
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        res[member][strippedKey] = data[key];
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        res[key] = data[key];
      }
    });
    return res as T;
  }
}
