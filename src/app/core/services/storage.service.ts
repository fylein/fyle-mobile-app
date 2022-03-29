import { Injectable } from '@angular/core';

import 'capacitor-secure-storage-plugin';
import { Plugins } from '@capacitor/core';

const { SecureStoragePlugin } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  async set(key: string, value: any) {
    return await SecureStoragePlugin.set({
      key,
      value: JSON.stringify(value),
    });
  }

  async get(key: string) {
    const stringifiedObject = await SecureStoragePlugin.get({
      key,
    });

    if (stringifiedObject && stringifiedObject.value) {
      return JSON.parse(stringifiedObject.value);
    } else {
      return null;
    }
  }

  async delete(key: string) {
    return await SecureStoragePlugin.remove({ key });
  }

  async clearAll() {
    return await SecureStoragePlugin.clear();
  }
}
