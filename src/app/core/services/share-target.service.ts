import { Injectable } from '@angular/core';

export interface PendingSharedFile {
  uri: string;
  name: string;
  mimeType: string;
}

export interface PendingReceiptForNewExpense {
  dataUrl: string;
  type: string;
}

/**
 * Holds files shared to the app via the system share sheet (e.g. from gallery or files).
 * Single image/PDF: consumed by add-edit-expense to attach as receipt.
 * Multiple files: TODO handle later.
 */
@Injectable({
  providedIn: 'root',
})
export class ShareTargetService {
  private pendingFiles: PendingSharedFile[] = [];

  private pendingReceiptForNewExpense: PendingReceiptForNewExpense | null = null;

  setPendingSharedFiles(files: PendingSharedFile[]): void {
    this.pendingFiles = files || [];
  }

  getAndClearPendingFiles(): PendingSharedFile[] {
    const files = this.pendingFiles;
    this.pendingFiles = [];
    return files;
  }

  hasPendingFiles(): boolean {
    return this.pendingFiles.length > 0;
  }

  setPendingReceiptForNewExpense(receipt: PendingReceiptForNewExpense): void {
    this.pendingReceiptForNewExpense = receipt;
  }

  getAndClearPendingReceiptForNewExpense(): PendingReceiptForNewExpense | null {
    const receipt = this.pendingReceiptForNewExpense;
    this.pendingReceiptForNewExpense = null;
    return receipt;
  }
}
