import { Injectable } from '@angular/core';
import 'capacitor-secure-storage-plugin';
import { Plugins } from '@capacitor/core';

const { SecureStoragePlugin } = Plugins;

// This is used only for storing access token, refresh token and cluster domain in token service
@Injectable({
  providedIn: 'root',
})
export class SecureStorageService {
  constructor() {}

  async set(key: string, value: any) {
    return await SecureStoragePlugin.set({
      key,
      value: JSON.stringify(value),
    });
  }

  async get(key: string) {
    try {
      const stringifiedObject = await SecureStoragePlugin.get({
        key,
      });
      if (stringifiedObject?.value) {
        return JSON.parse(stringifiedObject.value);
      }
    } catch {
      return null;
    }
  }

  async delete(key: string) {
    try {
      return await SecureStoragePlugin.remove({ key });
    } catch {
      return null;
    }
  }

  async clearAll() {
    return await SecureStoragePlugin.clear();
  }
}
