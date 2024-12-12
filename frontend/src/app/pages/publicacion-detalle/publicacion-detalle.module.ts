import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PublicacionDetallePageRoutingModule } from './publicacion-detalle-routing.module';

import { PublicacionDetallePage } from './publicacion-detalle.page';
import { MenuPublicacionComponent } from '../../components/menu-publicacion/menu-publicacion.component';

import { MapModalModule } from '../../components/map-modal/map-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PublicacionDetallePageRoutingModule,
    MenuPublicacionComponent,
    MapModalModule
  ],
  declarations: [PublicacionDetallePage]
})
export class PublicacionDetallePageModule {}
