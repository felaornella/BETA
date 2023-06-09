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
import { PublicationItemComponent } from 'src/app/components/publication-item/publication-item.component';
import { MenuPerfilComponent } from 'src/app/components/menu-perfil/menu-perfil.component';
import { MapPerfilComponent } from 'src/app/components/map-perfil/map-perfil.component';

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
    RouterModule.forChild(routes)
  ],
  declarations: [
    ProfilePage,
    TextInfoComponent,
    SocialsTextComponent,
    OwnPetsComponent,
    PublicationItemComponent,
    MenuPerfilComponent,
    MapPerfilComponent]
})
export class ProfilePageModule {}
