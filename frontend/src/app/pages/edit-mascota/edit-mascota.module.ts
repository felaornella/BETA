import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditMascotaPageRoutingModule } from './edit-mascota-routing.module';

import { EditMascotaPage } from './edit-mascota.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditMascotaPageRoutingModule
  ],
  declarations: [EditMascotaPage]
})
export class EditMascotaPageModule {}
