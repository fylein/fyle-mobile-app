import { Injectable } from '@angular/core';
import { DocumentScanner, ScanResult } from '@capacitor-mlkit/document-scanner';
import { Filesystem, Encoding } from '@capacitor/filesystem';
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

  private async convertFileToBase64(fileUri: string): Promise<string> {
    try {
      // Read the file content using Filesystem API
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await Filesystem.readFile({
        path: fileUri,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        encoding: Encoding.UTF8,
      });

      // file.data will be base64 string
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return 'data:image/jpeg;base64,' + result.data;
    } catch {
      throw new Error('Failed to read file from URI');
    }
  }
}
