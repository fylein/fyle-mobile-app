import { Injectable } from '@angular/core';
import { DocumentScanner, ScanResult } from '@capacitor-mlkit/document-scanner';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MLKitDocumentScannerService {
  scanDocument(): Observable<string> {
    return from(DocumentScanner.scanDocument({ resultFormats: 'JPEG', galleryImportAllowed: true, pageLimit: 1 })).pipe(
      switchMap((result: ScanResult) => {
        if (result.scannedImages && result.scannedImages.length > 0) {
          // MLKit returns file URLs, so we need to convert them to base64
          return from(this.convertFileToBase64(result.scannedImages[0]));
        }
        throw new Error('No document scanned');
      }),
    );
  }

  private async convertFileToBase64(fileUrl: string): Promise<string> {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      return new Promise<string>((resolve, reject): void => {
        const reader = new FileReader();
        reader.onloadend = (): void => {
          const base64data = reader.result as string;
          resolve(base64data);
        };
        reader.onerror = (): void => reject(new Error('Failed to convert file to base64'));
        reader.readAsDataURL(blob);
      });
    } catch {
      throw new Error('Failed to convert file to base64');
    }
  }
}
