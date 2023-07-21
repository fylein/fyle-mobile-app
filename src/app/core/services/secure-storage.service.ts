import { Injectable } from '@angular/core';
import 'capacitor-secure-storage-plugin';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

// This is used only for storing access token, refresh token and cluster domain in token service
@Injectable({
  providedIn: 'root',
})
export class SecureStorageService {
  async set<T>(key: string, value: T): Promise<{ value: boolean }> {
    try {
      return await SecureStoragePlugin.set({
        key,
        value: JSON.stringify(value),
      });
    } catch {
      //Need to clear the storage when this method throws an error
      //Ref: https://github.com/martinkasa/capacitor-secure-storage-plugin/issues/54#issuecomment-1185446767
      return this.clearAll();
    }
  }

  async get<T>(key: string): Promise<T> {
    try {
      const stringifiedObject = await SecureStoragePlugin.get({
        key,
      });
      if (stringifiedObject?.value) {
        return JSON.parse(stringifiedObject.value) as T;
      }
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<{ value: boolean }> {
    try {
      return await SecureStoragePlugin.remove({ key });
    } catch {
      return null;
    }
  }

  async clearAll(): Promise<{ value: boolean }> {
    try {
      return await SecureStoragePlugin.clear();
    } catch {
      return null;
    }
  }
}
