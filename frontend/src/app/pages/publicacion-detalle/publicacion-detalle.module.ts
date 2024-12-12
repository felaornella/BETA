import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PublicacionDetallePageRoutingModule } from './publicacion-detalle-routing.module';

import { PublicacionDetallePage } from './publicacion-detalle.page';
import { MenuPublicacionComponent } from '../../components/menu-publicacion/menu-publicacion.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PublicacionDetallePageRoutingModule,
    MenuPublicacionComponent
  ],
  declarations: [PublicacionDetallePage]
})
export class PublicacionDetallePageModule {}
