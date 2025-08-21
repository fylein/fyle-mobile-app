import { Injectable, inject } from '@angular/core';
import { InAppBrowser, InAppBrowserOptions } from '@awesome-cordova-plugins/in-app-browser/ngx';
@Injectable({
  providedIn: 'root',
})
export class InAppBrowserService {
  private inAppBrowser = inject(InAppBrowser);

  create(url: string, target?: string, options?: string | InAppBrowserOptions) {
    return this.inAppBrowser.create(url, target, options);
  }
}
