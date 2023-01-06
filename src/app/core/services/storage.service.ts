import { Injectable } from '@angular/core';

import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  async set(key: string, value: any) {
    return await Preferences.set({
      key,
      value: JSON.stringify(value),
    });
  }

  async get(key: string) {
    const stringifiedObject = await Preferences.get({
      key,
    });

    if (stringifiedObject && stringifiedObject.value) {
      return JSON.parse(stringifiedObject.value);
    } else {
      return null;
    }
  }

  async delete(key: string) {
    return await Preferences.remove({ key });
  }

  async clearAll() {
    return await Preferences.clear();
  }
}
