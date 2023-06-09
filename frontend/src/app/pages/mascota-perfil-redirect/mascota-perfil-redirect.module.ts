import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MascotaPerfilRedirectPageRoutingModule } from './mascota-perfil-redirect-routing.module';

import { MascotaPerfilRedirectPage } from './mascota-perfil-redirect.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MascotaPerfilRedirectPageRoutingModule
  ],
  declarations: [MascotaPerfilRedirectPage]
})
export class MascotaPerfilRedirectPageModule {}
