import { Injectable } from '@angular/core';

import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  async set(key: string, value: any): Promise<void> {
    return await Preferences.set({
      key,
      value: JSON.stringify(value),
    });
  }

  async get<T>(key: string): Promise<T> {
    const stringifiedObject = await Preferences.get({
      key,
    });

    if (stringifiedObject && stringifiedObject.value) {
      return JSON.parse(stringifiedObject.value) as T;
    } else {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    return await Preferences.remove({ key });
  }

  async clearAll(): Promise<void> {
    return await Preferences.clear();
  }
}
