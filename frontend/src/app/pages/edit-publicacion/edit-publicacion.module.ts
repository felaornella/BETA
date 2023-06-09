import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditPublicacionPageRoutingModule } from './edit-publicacion-routing.module';

import { EditPublicacionPage } from './edit-publicacion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditPublicacionPageRoutingModule
  ],
  declarations: [EditPublicacionPage]
})
export class EditPublicacionPageModule {}
