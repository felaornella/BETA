import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgrupacionesPage } from './agrupaciones.page';

const routes: Routes = [
  {
    path: '',
    component: AgrupacionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgrupacionesPageRoutingModule {}
