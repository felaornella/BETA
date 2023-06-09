import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MiMascotaDetallePage } from './mi-mascota-detalle.page';

const routes: Routes = [
  {
    path: '',
    component: MiMascotaDetallePage
  },
  {
    path: ':mascotaId',
    component: MiMascotaDetallePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MiMascotaDetallePageRoutingModule {}
