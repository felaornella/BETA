import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeAdopTranPageRoutingModule } from './home-adop-tran-routing.module';

import { HomeAdopTranPage } from './home-adop-tran.page';
import { PublicationItemModule } from '../../components/publication-item/publication-item.module';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeAdopTranPageRoutingModule,
    PublicationItemModule
  ],
  declarations: [HomeAdopTranPage],
  providers: [Geolocation]
})
export class HomeAdopTranPageModule {}
