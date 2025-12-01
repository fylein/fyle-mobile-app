import { Injectable, inject } from '@angular/core';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { firstValueFrom, of } from 'rxjs';
import { catchError, defaultIfEmpty } from 'rxjs/operators';
import { RouterAuthService } from './router-auth.service';
import { SecureStorageService } from './secure-storage.service';
import { StorageService } from './storage.service';
import { TokenService } from './token.service';
import { PlatformOrgSettingsService } from './platform/v1/spender/org-settings.service';
import { FORMAT_PREFERENCES } from 'src/app/constants';
import { FormatPreferences } from 'src/app/core/models/format-preferences.model';
import { OrgSettings, RegionalSettings } from 'src/app/core/models/org-settings.model';

@Injectable()
export class ConfigService {
  private routerAuthService = inject(RouterAuthService);

  private tokenService = inject(TokenService);

  private storageService = inject(StorageService);

  private secureStorageService = inject(SecureStorageService);

  private orgSettingsService = inject(PlatformOrgSettingsService);

  private formatPreferences = inject<FormatPreferences>(FORMAT_PREFERENCES);

  private datePipeOptions = inject(DATE_PIPE_DEFAULT_OPTIONS);

  async loadConfigurationData(): Promise<void> {
    const clusterDomain: string = await this.tokenService.getClusterDomain();

    if (clusterDomain) {
      // if clusterdomain is present use that
      await this.routerAuthService.setClusterDomain(clusterDomain);
    } else {
      await this.secureStorageService.clearAll();
      await this.storageService.clearAll();
    }

    const orgSettings = (await firstValueFrom(
      this.orgSettingsService.get().pipe(
        defaultIfEmpty(null),
        catchError(() => of(null)),
      ),
    )) as OrgSettings | null;

    const regional: RegionalSettings | undefined = orgSettings?.regional_settings;

    if (regional?.time_format) {
      this.formatPreferences.timeFormat = regional.time_format;
    }

    if (regional?.currency_format) {
      const cf = regional.currency_format;
      this.formatPreferences.currencyFormat = {
        placement: cf.symbol_position === 'after' ? 'after' : 'before',
        thousandSeparator: cf.thousand_separator ?? this.formatPreferences.currencyFormat.thousandSeparator,
        decimalSeparator: cf.decimal_separator ?? this.formatPreferences.currencyFormat.decimalSeparator,
      };
    }

    if (regional?.date_format) {
      this.datePipeOptions.dateFormat = regional.date_format;
    }
  }
}
