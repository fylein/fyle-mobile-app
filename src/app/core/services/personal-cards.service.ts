import { Injectable } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ApiV2Service } from './api-v2.service';
import { ExpenseAggregationService } from './expense-aggregation.service';

@Injectable({
  providedIn: 'root'
})
export class PersonalCardsService {

  constructor(
    private inAppBrowser: InAppBrowser,
    private apiv2Service: ApiV2Service,
    private expenseAggregationService: ExpenseAggregationService
  ) {

  }

  getToken() {
    this.expenseAggregationService.get('/yodlee/access_token').subscribe((accessToken) => {
      this.linkNow(accessToken.fast_link_url, accessToken.access_token);
    });
  }

  linkNow(url, access_token) {
    const pageContent = `<form id="fastlink-form" name="fastlink-form" action="` + url + `" method="POST">
                          <input name="accessToken" value="Bearer `+ access_token + `" hidden="true" />
                          <input  name="extraParams" value="configName=Aggregation&callback=success://" hidden="true" />
                          </form> 
                          <script type="text/javascript">
                          document.getElementById("fastlink-form").submit();
                          </script>
                          `;
    const pageContentUrl = 'data:text/html;base64,' + btoa(pageContent);
    const browser = this.inAppBrowser.create(pageContentUrl, '_blank', 'location=yes,beforeload=yes');
    browser.on('beforeload').subscribe((event) => {
      console.log(event.url);
      console.log(event.url.substring(0,10));
      if (event.url.substring(0,10) === 'success://') {
         const decodedData = JSON.parse(decodeURIComponent(event.url.slice(30)));
         console.log(decodedData);
         browser.close();
      }

    });
  }

  getLinkedAccounts(): Observable<any> {
    return this.apiv2Service.get('/personal_bank_accounts', {
      params: {
        order: 'last_synced_at.desc',
      },
    });
  }

  getLinkedAccountsCount() {
    return this.getLinkedAccounts().pipe(map((res) => res.count));
  }
}
