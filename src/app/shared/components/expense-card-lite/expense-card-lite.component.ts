import { Component, Input, OnInit } from '@angular/core';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { FileService } from 'src/app/core/services/file.service';

@Component({
  selector: 'app-expense-card-lite',
  templateUrl: './expense-card-lite.component.html',
  styleUrls: ['./expense-card-lite.component.scss'],
})
export class ExpenseCardLiteComponent implements OnInit {
  @Input() expense;

  isReceiptPresent: boolean;

  constructor(private fileService: FileService) {}

  ngOnInit(): void {
    this.getReceipt();
  }

  getReceipt() {
    this.fileService.findByTransactionId(this.expense.id).subscribe((files: FileObject[]) => {
      this.isReceiptPresent = files.length > 0;
    });
  }
}
