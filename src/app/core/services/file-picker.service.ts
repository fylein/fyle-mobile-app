import { Injectable } from '@angular/core';
import { FilePicker } from '@whiteguru/capacitor-plugin-file-picker';

@Injectable({
  providedIn: 'root',
})
export class FilePickerService {
  pick(options: { multiple: boolean; mimes: string[] }): ReturnType<typeof FilePicker.pick> {
    return FilePicker.pick(options);
  }
}
