import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MascotaPerfilRedirectPage } from './mascota-perfil-redirect.page';

const routes: Routes = [
  {
    path: '',
    component: MascotaPerfilRedirectPage
  },
  {
    path: ':mascotaId',
    component: MascotaPerfilRedirectPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MascotaPerfilRedirectPageRoutingModule {}
