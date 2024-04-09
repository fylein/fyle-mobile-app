import { Injectable } from '@angular/core';
import { Clipboard } from '@capacitor/clipboard';

@Injectable({
  providedIn: 'root',
})
export class ClipboardService {
  constructor() {}

  async writeString(textToCopy: string) {
    await Clipboard.write({
      // eslint-disable-next-line id-blacklist
      string: textToCopy,
    });
  }
}
