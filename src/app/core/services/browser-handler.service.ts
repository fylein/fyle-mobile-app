import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';

@Injectable({
  providedIn: 'root',
})
export class BrowserHandlerService {
  constructor() {}

  openLinkWithToolbarColor(toolbarColor: string, url: string): void {
    Browser.open({ toolbarColor, url });
  }

  openLinkWithWindowName(windowName: string, url: string): void {
    Browser.open({ url, windowName });
  }
}
