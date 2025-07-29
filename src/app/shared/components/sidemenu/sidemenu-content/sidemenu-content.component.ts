import { Component, OnInit, Input } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { globalCacheBusterNotifier } from 'ts-cacheable';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { FreshChatService } from 'src/app/core/services/fresh-chat.service';
import { SidemenuItem } from 'src/app/core/models/sidemenu-item.model';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TrackingService } from 'src/app/core/services/tracking.service';

@Component({
  selector: 'app-sidemenu-content',
  templateUrl: './sidemenu-content.component.html',
  styleUrls: ['./sidemenu-content.component.scss'],
  standalone: false,
})
export class SidemenuContentComponent implements OnInit {
  @Input() sideMenuList: Partial<SidemenuItem>[];

  @Input() primaryOptionsCount: number;

  constructor(
    private router: Router,
    private userEventService: UserEventService,
    private menuController: MenuController,
    private freshChatService: FreshChatService,
    private loaderService: LoaderService,
    private trackingService: TrackingService,
  ) {}

  ngOnInit(): void {}

  goToRoute(sidemenuItem: Partial<SidemenuItem>) {
    this.trackingService.menuItemClicked({ option: sidemenuItem.title });
    if (sidemenuItem.dropdownOptions?.length) {
      sidemenuItem.isDropdownOpen = !sidemenuItem.isDropdownOpen;
      return;
    }
    this.menuController.close();

    if (!!sidemenuItem.openLiveChat) {
      if (!(window as any).fcWidget?.isInitialized()) {
        this.loaderService.showLoader();
        this.freshChatService.setupNetworkWatcher();
        (window as any).fcWidget.on('widget:loaded', () => {
          this.freshChatService.openLiveChatSupport();
          this.loaderService.hideLoader();
        });
      } else {
        this.freshChatService.openLiveChatSupport();
      }
      return;
    }

    if (sidemenuItem.route.indexOf('switch_org') > -1) {
      this.userEventService.clearCache();
      globalCacheBusterNotifier.next();
    }
    this.router.navigate(sidemenuItem.route);
  }
}
