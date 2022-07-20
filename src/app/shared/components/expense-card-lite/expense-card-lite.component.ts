import { Component, Input, OnInit } from '@angular/core';
import { noop } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FileObject } from 'src/app/core/models/file_obj.model';
import { FileService } from 'src/app/core/services/file.service';

@Component({
  selector: 'app-expense-card-lite',
  templateUrl: './expense-card-lite.component.html',
  styleUrls: ['./expense-card-lite.component.scss'],
})
export class ExpenseCardLiteComponent implements OnInit {
  @Input() expense;

  receiptThumbnail: string;

  constructor(private fileService: FileService) {}

  ngOnInit(): void {
    this.getReceipt();
  }

  getReceipt() {
    this.fileService
      .getFilesWithThumbnail(this.expense.id)
      .pipe(
        switchMap((ThumbFiles: FileObject[]) => {
          if (ThumbFiles.length > 0) {
            return this.fileService.downloadThumbnailUrl(ThumbFiles[0].id);
          } else {
            return [];
          }
        })
      )
      .subscribe((downloadUrl: FileObject[]) => {
        this.receiptThumbnail = downloadUrl[0].url;
      });
  }
}
