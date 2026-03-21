import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { PCacheable, PCacheBuster } from 'ts-cacheable';

const storageCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  @PCacheBuster({
    cacheBusterNotifier: storageCacheBuster$,
  })
  async set(key: string, value: any): Promise<void> {
    return await Preferences.set({
      key,
      value: JSON.stringify(value),
    });
  }

  @PCacheable({
    cacheBusterObserver: storageCacheBuster$,
  })
  async get<T>(key: string): Promise<T> {
    const stringifiedObject = await Preferences.get({ key });
    if (stringifiedObject?.value) {
      return JSON.parse(stringifiedObject.value) as T;
    }
    return null;
  }

  @PCacheBuster({
    cacheBusterNotifier: storageCacheBuster$,
  })
  async delete(key: string): Promise<void> {
    return await Preferences.remove({ key });
  }

  @PCacheBuster({
    cacheBusterNotifier: storageCacheBuster$,
  })
  async clearAll(): Promise<void> {
    return await Preferences.clear();
  }
}
