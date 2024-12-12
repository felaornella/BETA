import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewPublicationPageRoutingModule } from './new-publication-routing.module';

import { NewPublicationPage } from './new-publication.page';
import { RouterModule, Routes } from '@angular/router';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { MapModalModule } from '../../components/map-modal/map-modal.module';

const routes: Routes = [
  {
    path: '',
    component: NewPublicationPage,
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewPublicationPageRoutingModule,
    RouterModule.forChild(routes),
    MapModalModule
  ],
  declarations: [NewPublicationPage],
  providers: [Geolocation]
})
export class NewPublicationPageModule {}
