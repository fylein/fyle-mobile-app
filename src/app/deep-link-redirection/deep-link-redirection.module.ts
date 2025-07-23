import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeepLinkRedirectionPageRoutingModule } from './deep-link-redirection-routing.module';

import { DeepLinkRedirectionPage } from './deep-link-redirection.page';

@NgModule({
    imports: [CommonModule, FormsModule, IonicModule, DeepLinkRedirectionPageRoutingModule, DeepLinkRedirectionPage],
})
export class DeepLinkRedirectionPageModule {}
