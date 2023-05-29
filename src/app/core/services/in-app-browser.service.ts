import { Injectable } from '@angular/core';
import { InAppBrowser, InAppBrowserOptions } from '@awesome-cordova-plugins/in-app-browser/ngx';
@Injectable({
  providedIn: 'root',
})
export class InAppBrowserService {
  constructor(private inAppBrowser: InAppBrowser) {}

  create(url: string, target?: string, options?: string | InAppBrowserOptions) {
    return this.inAppBrowser.create(url, target, options);
  }
}
