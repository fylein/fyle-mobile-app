import { Injectable } from '@angular/core';
import { DocumentScanner, ScanResult } from '@capacitor-mlkit/document-scanner';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MLKitDocumentScannerService {
  scanDocument(isBulkMode = false): Observable<string> {
    return from(
      DocumentScanner.scanDocument({
        resultFormats: 'JPEG',
        galleryImportAllowed: false, // Disable gallery import to prevent additional UI
        pageLimit: isBulkMode ? 20 : 1, // Allow up to 20 pages in bulk mode, 1 in single mode
        scannerMode: 'BASE', // Use basic mode to minimize editing UI
      }),
    ).pipe(
      switchMap((result: ScanResult) => {
        if (!result || !result.scannedImages || result.scannedImages.length === 0) {
          throw new Error('No document scanned or scan was cancelled');
        }
        // In bulk mode, we still return one image at a time to maintain compatibility
        return from(this.convertFileToBase64(result.scannedImages[0]));
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
