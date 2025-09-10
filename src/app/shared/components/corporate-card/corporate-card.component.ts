import { Component, Input, OnInit, inject, output } from '@angular/core';
import { PlatformCorporateCard } from 'src/app/core/models/platform/platform-corporate-card.model';
import { DataFeedSource } from 'src/app/core/enums/data-feed-source.enum';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { CardNumberComponent } from '../card-number/card-number.component';
import { DatePipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-corporate-card',
  templateUrl: './corporate-card.component.html',
  styleUrls: ['./corporate-card.component.scss'],
  imports: [IonicModule, CardNumberComponent, DatePipe, TranslocoPipe],
})
export class CorporateCardComponent implements OnInit {
  private corporateCreditCardExpenseService = inject(CorporateCreditCardExpenseService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() card: PlatformCorporateCard;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() hideOptionsMenu: boolean;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() isVisaRTFEnabled: boolean;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() isMastercardRTFEnabled: boolean;

  readonly cardOptionsClick = output<PlatformCorporateCard>();

  isRTFEnabled: boolean;

  isCardConnectedToRTF: boolean;

  isCardConnectedToBankFeed: boolean;

  showCardOptionsMenu: boolean;

  dataFeedSourceTypes: typeof DataFeedSource = DataFeedSource;

  ngOnInit(): void {
    this.isRTFEnabled = this.isVisaRTFEnabled || this.isMastercardRTFEnabled;

    this.isCardConnectedToRTF = this.card.is_mastercard_enrolled || this.card.is_visa_enrolled;

    const bankFeedSources = this.corporateCreditCardExpenseService.getBankFeedSources();
    this.isCardConnectedToBankFeed = bankFeedSources.includes(this.card.data_feed_source);

    // Only show the options menu to RTF enrolled cards and statement uploaded cards where RTF is enabled
    const isCardConnectedViaStatementUpload = this.card.data_feed_source === DataFeedSource.STATEMENT_UPLOAD;
    this.showCardOptionsMenu =
      !this.hideOptionsMenu && (this.isCardConnectedToRTF || (isCardConnectedViaStatementUpload && this.isRTFEnabled));
  }
}
