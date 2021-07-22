import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { from, noop, Observable } from 'rxjs';
import { Expense } from 'src/app/core/models/expense.model';
import { ExpenseFieldsMap } from 'src/app/core/models/v1/expense-fields-map.model';
import { TransactionService } from 'src/app/core/services/transaction.service';
import {getCurrencySymbol} from '@angular/common';
import { OfflineService } from 'src/app/core/services/offline.service';
import { concatMap, finalize, map, switchMap } from 'rxjs/operators';
import { isEqual, reduce } from 'lodash';
import { FileService } from 'src/app/core/services/file.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { PopoverController } from '@ionic/angular';
import { CameraOptionsPopupComponent } from 'src/app/fyle/add-edit-expense/camera-options-popup/camera-options-popup.component';
import { FileObject } from 'src/app/core/models/file_obj.model';

@Component({
  selector: 'app-expense-card',
  templateUrl: './expenses-card.component.html',
  styleUrls: ['./expenses-card.component.scss'],
})
export class ExpensesCardComponent implements OnInit {

  @Input() expense: Expense;
  @Input() previousExpenseTxnDate;
  @Input() previousExpenseCreatedAt;
  @Input() isSelectionModeEnabled: boolean;
  @Input() selectedElements: Expense[];
  @Input() isFirstOfflineExpense: boolean;
  @Input() attachments;

  @Output() goToTransaction: EventEmitter<Expense> = new EventEmitter();
  @Output() cardClickedForSelection: EventEmitter<Expense> = new EventEmitter();
  @Output() setMultiselectMode: EventEmitter<Expense> = new EventEmitter();

  expenseFields$: Observable<Partial<ExpenseFieldsMap>>;
  receipt: string;
  showDt = true;
  isPolicyViolated: boolean;
  isCriticalPolicyViolated: boolean;
  homeCurrency: string;
  homeCurrencySymbol = '';
  foreignCurrencySymbol = '';
  paymentModeIcon: string;
  isScanInProgress: boolean;
  isProjectMandatory$: Observable<boolean>;
  attachmentUploadInProgress = false;
  attachedReceiptsCount = 0;
  receiptThumbnail = null;

  constructor(
    private transactionService: TransactionService,
    private offlineService: OfflineService,
    private fileService: FileService,
    private transactionOutboxService: TransactionsOutboxService,
    private popoverController: PopoverController
  ) { }


  onGoToTransaction() {
    if (!this.isSelectionModeEnabled) {
      this.goToTransaction.emit(this.expense);
    }
  }

  get isSelected() {
    if (this.expense.tx_id) {
      return this.selectedElements.some(txn => this.expense.tx_id === txn.tx_id);
    } else {
      return this.selectedElements.some(txn => isEqual(this.expense, txn));
    }
  }

  getReceipt() {
    if (this.expense.tx_fyle_category && this.expense.tx_fyle_category.toLowerCase() === 'mileage') {
      this.receipt = 'assets/svg/fy-mileage.svg';
    } else if (this.expense.tx_fyle_category && this.expense.tx_fyle_category.toLowerCase() === 'per diem') {
      this.receipt = 'assets/svg/fy-calendar.svg';
    } else {
      // Todo: Get thumbnail of image in V2
      if (!this.expense.tx_file_ids) {
        this.receipt = 'assets/svg/fy-add-receipt.svg';
      } else {
        this.receipt = 'assets/svg/fy-expense.svg';
      }
    }
  }

  ngOnInit() {
    this.expense.isDraft = this.transactionService.getIsDraft(this.expense)
    this.expense.isPolicyViolated = (this.expense.tx_manual_flag || this.expense.tx_policy_flag);
    this.expense.isCriticalPolicyViolated = this.transactionService.getIsCriticalPolicyViolated(this.expense);
    this.expense.vendorDetails = this.transactionService.getVendorDetails(this.expense);
    this.expenseFields$ = this.offlineService.getExpenseFieldsMap();

    this.offlineService.getHomeCurrency().pipe(
      map((homeCurrency) => {
        this.homeCurrency = homeCurrency;
        this.homeCurrencySymbol = getCurrencySymbol(homeCurrency, 'wide');
        this.foreignCurrencySymbol = getCurrencySymbol(this.expense.tx_orig_currency, 'wide');
      })
    ).subscribe(noop);
    this.homeCurrencySymbol = getCurrencySymbol(this.expense.tx_currency, 'wide');
    this.isProjectMandatory$ = this.offlineService.getOrgSettings().pipe(
      map((orgSettings) => {
         return orgSettings.transaction_fields_settings && 
                orgSettings.transaction_fields_settings.transaction_mandatory_fields && 
                orgSettings.transaction_fields_settings.transaction_mandatory_fields.project;
      })
    );

    if (!this.expense.tx_id) {
      this.showDt = !!this.isFirstOfflineExpense;
    } else if (this.previousExpenseTxnDate || this.previousExpenseCreatedAt) {
      const currentDate = (this.expense && (new Date(this.expense.tx_txn_dt || this.expense.tx_created_at)).toDateString());
      const previousDate = new Date(this.previousExpenseTxnDate || this.previousExpenseCreatedAt).toDateString();
      this.showDt = currentDate !== previousDate;
    }

    this.getReceipt();

    if (this.expense.tx_file_ids) {
      this.fileService.downloadUrl(this.expense.tx_file_ids[0]).pipe(
        map(downloadUrl => {
          this.receiptThumbnail = {};
          this.receiptThumbnail.url = downloadUrl;
          const details = this.getReceiptDetails(this.receiptThumbnail);
          this.receiptThumbnail.type = details.type;
        })
      ).subscribe(noop);
    }

    this.isScanInProgress = this.getScanningReceiptCard(this.expense);

    if (this.expense.source_account_type === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT') {
        if (this.expense.tx_corporate_credit_card_expense_group_id) {
          this.paymentModeIcon = 'fy-matched';
        } else {
          this.paymentModeIcon = 'fy-unmatched';
        }
    } else {
      if (!this.expense.tx_skip_reimbursement) {
        this.paymentModeIcon = 'fy-reimbursable';
      } else {
        this.paymentModeIcon = 'fy-non-reimbursable';
      }
    }

  }

  getScanningReceiptCard(expense: Expense): boolean {
    if (expense.tx_fyle_category && (expense.tx_fyle_category.toLowerCase() === 'mileage' || expense.tx_fyle_category.toLowerCase() === 'per diem')) {
      return false;
    } else {
      if (!expense.tx_currency && !expense.tx_amount) {
        if (!expense.tx_extracted_data && !expense.tx_transcribed_data) {
          return true;
        }
      }
    }
    return false;
  }

  onSetMultiselectMode() {
    if (!this.isSelectionModeEnabled) {
      this.setMultiselectMode.emit(this.expense);
    }
  }

  onTapTransaction() {
    if (this.isSelectionModeEnabled) {
      this.cardClickedForSelection.emit(this.expense);
    }
  }
  
  async addAttachments(event) {

    const isMileageExpense = this.expense.tx_fyle_category && this.expense.tx_fyle_category.toLowerCase() === 'mileage';
    const isPerDiem = this.expense.tx_fyle_category && this.expense.tx_fyle_category.toLowerCase() === 'per diem';

    if (!(isMileageExpense||isPerDiem)) {
      event.stopPropagation();
      event.preventDefault();
  
      const popup = await this.popoverController.create({
        component: CameraOptionsPopupComponent,
        cssClass: 'camera-options-popover'
      });

      await popup.present();

      const { data } = await popup.onWillDismiss();
      if (data) {
        this.attachmentUploadInProgress = true;
        let attachmentType = this.getAttachmentType(data);

        from(this.transactionOutboxService.fileUpload(data.dataUrl, attachmentType)).pipe(
          switchMap((fileObj: FileObject) => {
            fileObj.transaction_id = this.expense.tx_id;
            this.expense.tx_file_ids = [];
            this.expense.tx_file_ids.push(fileObj.id);
            if (this.expense.tx_file_ids) {
              this.fileService.downloadUrl(this.expense.tx_file_ids[0]).pipe(
                map(downloadUrl => {
                  this.receiptThumbnail = {};
                  this.receiptThumbnail.url = downloadUrl;
                  const details = this.getReceiptDetails(this.receiptThumbnail);
                  this.receiptThumbnail.type = details.type;
                })
              ).subscribe(noop);
            }
            return this.fileService.post(fileObj);
          }),
          finalize(() => {
            this.attachmentUploadInProgress = false;
          })
        ).subscribe((attachments) => {
          this.attachedReceiptsCount = attachments;
        });
      }
    }
  }

  getAttachmentType(data) {
    let attachmentType = 'image';
    if (data.type === 'application/pdf' || data.type === 'pdf') {
      attachmentType = 'pdf';
    }
    return attachmentType;
  }

  getReceiptDetails(file) {
    const ext = this.getReceiptExtension(file.url);
    const res = {
      type: '',
    };

    if (ext && (['pdf'].indexOf(ext) > -1)) {
      res.type = 'pdf';
    } else if (ext && (['png', 'jpg', 'jpeg', 'gif'].indexOf(ext) > -1)) {
      res.type = 'image';
    }

    return res;
  }


  getReceiptExtension(url) {
    let res = null;
    const name = url.split('?')[0];
    if (name) {
      const filename = name.toLowerCase();
      const idx = filename.lastIndexOf('.');

      if (idx > -1) {
        res = filename.substring(idx + 1, filename.length);
      }
    }

    return res;
  }

}
