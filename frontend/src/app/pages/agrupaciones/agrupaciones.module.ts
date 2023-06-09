import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgrupacionesPageRoutingModule } from './agrupaciones-routing.module';

import { AgrupacionesPage } from './agrupaciones.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgrupacionesPageRoutingModule
  ],
  declarations: [AgrupacionesPage]
})
export class AgrupacionesPageModule {}
