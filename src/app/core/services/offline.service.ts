import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { globalCacheBusterNotifier } from 'ts-cacheable';

@Injectable({
  providedIn: 'root',
})
export class OfflineService {
  constructor() {}

  load() {
    globalCacheBusterNotifier.next();

    return of(null);
  }
}
