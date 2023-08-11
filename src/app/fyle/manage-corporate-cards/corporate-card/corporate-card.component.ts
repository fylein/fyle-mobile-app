import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PlatformCorporateCard } from 'src/app/core/models/platform/platform-corporate-card.model';
import { DataFeedSource } from 'src/app/core/enums/data-feed-source.enum';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';

@Component({
  selector: 'app-corporate-card',
  templateUrl: './corporate-card.component.html',
  styleUrls: ['./corporate-card.component.scss'],
})
export class CorporateCardComponent implements OnInit {
  @Input() card: PlatformCorporateCard;

  @Input() isVisaRTFEnabled: boolean;

  @Input() isMastercardRTFEnabled: boolean;

  @Output() cardOptionsClick: EventEmitter<PlatformCorporateCard> = new EventEmitter<PlatformCorporateCard>();

  isRTFEnabled: boolean;

  isCardConnectedToRTF: boolean;

  isCardConnectedToBankFeed: boolean;

  showCardOptionsMenu: boolean;

  dataFeedSourceTypes: typeof DataFeedSource = DataFeedSource;

  constructor(private corporateCreditCardExpenseService: CorporateCreditCardExpenseService) {}

  ngOnInit(): void {
    this.isRTFEnabled = this.isVisaRTFEnabled || this.isMastercardRTFEnabled;

    this.isCardConnectedToRTF = this.card.is_mastercard_enrolled || this.card.is_visa_enrolled;

    const bankFeedSources = this.corporateCreditCardExpenseService.getBankFeedSources();
    this.isCardConnectedToBankFeed = bankFeedSources.includes(this.card.data_feed_source);

    // Only show the options menu to RTF enrolled cards and statement uploaded cards where RTF is enabled
    const isCardConnectedViaStatementUpload = this.card.data_feed_source === DataFeedSource.STATEMENT_UPLOAD;
    this.showCardOptionsMenu = this.isCardConnectedToRTF || (isCardConnectedViaStatementUpload && this.isRTFEnabled);
  }
}
