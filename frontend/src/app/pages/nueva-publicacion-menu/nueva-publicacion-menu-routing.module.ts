import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NuevaPublicacionMenuPage } from './nueva-publicacion-menu.page';

const routes: Routes = [
  {
    path: '',
    component: NuevaPublicacionMenuPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NuevaPublicacionMenuPageRoutingModule {}
