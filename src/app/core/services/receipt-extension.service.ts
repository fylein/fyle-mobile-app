import { FileObject } from 'src/app/core/models/file_obj.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ReceiptExtensionService {
  constructor() {}

  getReceiptExtension(name: string) {
    let ReceiptExtension = null;

    if (name) {
      const filename = name.toLowerCase();
      const index = filename.lastIndexOf('.');

      if (index > -1) {
        ReceiptExtension = filename.substring(index + 1, filename.length);
      }
    }

    return ReceiptExtension;
  }

  getReceiptDetails(file: FileObject) {
    const receiptExtn = this.getReceiptExtension(file.name);
    const receiptInfo = {
      type: 'unknown',
      thumbnail: 'img/fy-receipt.svg',
    };

    if (receiptExtn && ['pdf'].indexOf(receiptExtn) > -1) {
      receiptInfo.type = 'pdf';
      receiptInfo.thumbnail = 'img/fy-pdf.svg';
    } else if (receiptExtn && ['png', 'jpg', 'jpeg', 'gif'].indexOf(receiptExtn) > -1) {
      receiptInfo.type = 'image';
      receiptInfo.thumbnail = file.url;
    }
    return receiptInfo;
  }
}
