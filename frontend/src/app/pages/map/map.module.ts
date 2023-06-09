import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapPageRoutingModule } from './map-routing.module';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';

import { MapPage } from './map.page';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { PublicationItemComponent } from 'src/app/components/publication-item/publication-item.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapPageRoutingModule
  ],
  declarations: [MapPage,PublicationItemComponent],
  providers: [Geolocation,LocationAccuracy]
})
export class MapPageModule {}
