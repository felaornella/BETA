import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditPublicacionPageRoutingModule } from './edit-publicacion-routing.module';

import { EditPublicacionPage } from './edit-publicacion.page';

import { MapModalModule } from '../../components/map-modal/map-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditPublicacionPageRoutingModule,
    MapModalModule
  ],
  declarations: [EditPublicacionPage]
})
export class EditPublicacionPageModule {}
