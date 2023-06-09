import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeAdopTranPage } from './home-adop-tran.page';

const routes: Routes = [
  {
    path: '',
    component: HomeAdopTranPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeAdopTranPageRoutingModule {}
