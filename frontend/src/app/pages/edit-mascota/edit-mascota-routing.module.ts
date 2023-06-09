import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditMascotaPage } from './edit-mascota.page';

const routes: Routes = [
  {
    path: '',
    component: EditMascotaPage
  },
  {
    path: ':mascotaId',
    component: EditMascotaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditMascotaPageRoutingModule {}
