import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeAdopTranPageRoutingModule } from './home-adop-tran-routing.module';

import { HomeAdopTranPage } from './home-adop-tran.page';
import { PublicationItemComponent } from 'src/app/components/publication-item/publication-item.component';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeAdopTranPageRoutingModule
  ],
  declarations: [HomeAdopTranPage,PublicationItemComponent],
  providers: [Geolocation]
})
export class HomeAdopTranPageModule {}
