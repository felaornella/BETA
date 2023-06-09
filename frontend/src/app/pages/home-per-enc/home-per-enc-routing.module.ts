import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePerEncPage } from './home-per-enc.page';

const routes: Routes = [
  {
    path: '',
    component: HomePerEncPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePerEncPageRoutingModule {}
