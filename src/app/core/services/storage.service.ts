import { Injectable } from '@angular/core';

import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  async set(key: string, value: any) {
    return await Storage.set({
      key,
      value: JSON.stringify(value),
    });
  }

  async get(key: string) {
    const stringifiedObject = await Storage.get({
      key,
    });

    if (stringifiedObject && stringifiedObject.value) {
      return JSON.parse(stringifiedObject.value);
    } else {
      return null;
    }
  }

  async delete(key: string) {
    return await Storage.remove({ key });
  }

  async clearAll() {
    return await Storage.clear();
  }
}
