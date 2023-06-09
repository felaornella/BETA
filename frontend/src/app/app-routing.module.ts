import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home/perdidos-y-encontrados',
    loadChildren: () => import('./pages/home-per-enc/home-per-enc.module').then( m => m.HomePerEncPageModule)
  },
  {
    path: 'home/adopcion-y-transito',
    loadChildren: () => import('./pages/home-adop-tran/home-adop-tran.module').then( m => m.HomeAdopTranPageModule)
  },
  {
    path: 'nueva-publicacion-menu',
    loadChildren: () => import('./pages/nueva-publicacion-menu/nueva-publicacion-menu.module').then( m => m.NuevaPublicacionMenuPageModule)
  },
  {
    path: 'users',
    loadChildren: () => import('./pages/users/users.module').then( m => m.UsersPageModule)
  },
  {
    path: 'new-publicacion',
    loadChildren: () => import('./pages/new-publication/new-publication.module').then( m => m.NewPublicationPageModule)
  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'publicacion-detalle',
    loadChildren: () => import('./pages/publicacion-detalle/publicacion-detalle.module').then( m => m.PublicacionDetallePageModule)
  },
  {
    path: 'mis-mascotas',
    loadChildren: () => import('./pages/mis-mascotas/mis-mascotas.module').then( m => m.MisMascotasPageModule)
  },
  {
    path: 'mi-mascota-detalle',
    loadChildren: () => import('./pages/mi-mascota-detalle/mi-mascota-detalle.module').then( m => m.MiMascotaDetallePageModule)
  },
  {
    path: 'new-mascota',
    loadChildren: () => import('./pages/new-mascota/new-mascota.module').then( m => m.NewMascotaPageModule)
  },
  {
    path: 'edit-mascota',
    loadChildren: () => import('./pages/edit-mascota/edit-mascota.module').then( m => m.EditMascotaPageModule)
  },
  {
    path: 'buscar',
    loadChildren: () => import('./pages/buscar/buscar.module').then( m => m.BuscarPageModule)
  },
  {
    path: 'agrupaciones',
    loadChildren: () => import('./pages/agrupaciones/agrupaciones.module').then( m => m.AgrupacionesPageModule)
  },
  {
    path: 'new-mascota',
    loadChildren: () => import('./pages/new-mascota/new-mascota.module').then( m => m.NewMascotaPageModule)
  },
  {
    path: 'edit-mascota/:idMascota',
    loadChildren: () => import('./pages/edit-mascota/edit-mascota.module').then( m => m.EditMascotaPageModule)
  },
  {
    path: 'miperfil/editar',
    loadChildren: () => import('./pages/edit-user/edit-user.module').then( m => m.EditUserPageModule)
  },
  {
    path: 'miperfil/cambiarpassword',
    loadChildren: () => import('./pages/change-password/change-password.module').then( m => m.ChangePasswordPageModule)
  },
  {
    path: 'map',
    loadChildren: () => import('./pages/map/map.module').then( m => m.MapPageModule)
  },
  {
    path: 'recuperar-password',
    loadChildren: () => import('./pages/recovery-password/recovery-password.module').then( m => m.RecoveryPasswordPageModule)
  },
  {
    path: 'edit-publicacion',
    loadChildren: () => import('./pages/edit-publicacion/edit-publicacion.module').then( m => m.EditPublicacionPageModule)
  },
  {
    path: 'mascota/perfil/:idMascota',
    loadChildren: () => import('./pages/mascota-perfil-redirect/mascota-perfil-redirect.module').then( m => m.MascotaPerfilRedirectPageModule)
  },












];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
