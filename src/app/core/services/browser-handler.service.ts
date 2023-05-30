import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';

@Injectable({
  providedIn: 'root',
})
export class BrowserHandlerService {
  constructor() {}

  async openLinkWithToolbarColor(toolbarColor: string, url: string): Promise<void> {
    await Browser.open({ toolbarColor, url });
  }

  async openLinkWithWindowName(windowName: string, url: string): Promise<void> {
    await Browser.open({ url, windowName });
  }
}
