import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import { RouterModule, Routes } from '@angular/router';
import { SocialsTextComponent } from 'src/app/components/socials-text/socials-text.component';
import { TextInfoComponent } from 'src/app/components/text-info/text-info.component';
import { OwnPetsComponent } from 'src/app/components/own-pets/own-pets.component';

import { MenuPerfilComponent } from '../../components/menu-perfil/menu-perfil.component';
import { MapPerfilComponent } from '../../components/map-perfil/map-perfil.component';
import { PublicationItemModule } from '../../components/publication-item/publication-item.module';
import { MapModalModule } from '../../components/map-modal/map-modal.module';

const routes: Routes = [
  {
    path: ':userId',
    component: ProfilePage,
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    RouterModule.forChild(routes),
    MenuPerfilComponent,
    MapPerfilComponent,
    OwnPetsComponent,
    PublicationItemModule,
    MapModalModule
  ],
  declarations: [
    ProfilePage,
    TextInfoComponent,
    SocialsTextComponent]
})
export class ProfilePageModule {}
