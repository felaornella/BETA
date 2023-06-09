import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MiMascotaDetallePageRoutingModule } from './mi-mascota-detalle-routing.module';

import { MiMascotaDetallePage } from './mi-mascota-detalle.page';
import { MenuMascotaComponent } from 'src/app/components/menu-mascota/menu-mascota/menu-mascota.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MiMascotaDetallePageRoutingModule,
  ],
  declarations: [MiMascotaDetallePage, MenuMascotaComponent]
})
export class MiMascotaDetallePageModule {}
