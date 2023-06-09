import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NuevaPublicacionMenuPageRoutingModule } from './nueva-publicacion-menu-routing.module';

import { NuevaPublicacionMenuPage } from './nueva-publicacion-menu.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NuevaPublicacionMenuPageRoutingModule
  ],
  declarations: [NuevaPublicacionMenuPage]
})
export class NuevaPublicacionMenuPageModule {}
