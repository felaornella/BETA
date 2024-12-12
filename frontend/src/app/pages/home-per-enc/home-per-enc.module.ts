import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePerEncPageRoutingModule } from './home-per-enc-routing.module';

import { HomePerEncPage } from './home-per-enc.page';
import { PublicationItemModule } from 'src/app/components/publication-item/publication-item.module';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { MapModalModule } from '../../components/map-modal/map-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePerEncPageRoutingModule,
    PublicationItemModule,
    MapModalModule 
  ],
  declarations: [HomePerEncPage],
  providers: [Geolocation]
})
export class HomePerEncPageModule {}
