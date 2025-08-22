import { Injectable } from '@angular/core';
import { Clipboard } from '@capacitor/clipboard';

@Injectable({
  providedIn: 'root',
})
export class ClipboardService {
  constructor() {}

  async writeString(textToCopy: string) {
    await Clipboard.write({
      string: textToCopy,
    });
  }
}
