import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController, Platform, PopoverController, ToastController } from '@ionic/angular';
import { Publicacion } from 'src/app/models/Publicacion';
import { Usuario } from 'src/app/models/Usuario';
import { PublicacionesService } from 'src/app/services/publicaciones/publicaciones.service';
import { UsuariosService } from 'src/app/services/usuarios/usuarios.service';
import { getUrlImg } from 'src/app/utils/utils';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MenuPerfilComponent } from 'src/app/components/menu-perfil/menu-perfil.component';
import { MapModalComponent } from 'src/app/components/map-modal/map-modal.component';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  getUrlImg = getUrlImg;

  userLogged = this.authService.getUserInfo();
  information= true;
  publication= false;
  user: Usuario;
  userId: string;
  publicaciones: Array<Publicacion> ;
  cant_publicaciones = {"1":0,"2":0,"3":0,"4":0};
  constructor(
    private modalCtrl: ModalController,
    public popoverController: PopoverController,
    private toastController: ToastController,
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private publicacionesService : PublicacionesService,
    public activatedRoute: ActivatedRoute,
     public navCtrl: NavController) {
     this.userId = String(this.activatedRoute.snapshot.paramMap.get('userId'));
   }

  ngOnInit() {
    //this.cargarPublisPrueba();
    this.activatedRoute.queryParams.subscribe(params => {
      if (params && params.reload) {
        this.publicacionesService.obtenerMisPublicaciones().subscribe((data) => {
          //console.log(data)
          this.publicaciones = (data as Array<Publicacion>);
          this.publicaciones.forEach((e)=>{ e.visible=true; this.cant_publicaciones[e.tipo]++; });
          //console.log(this.publicaciones);
        });
      }
    });
    this.checkLoggedUser();
    this.getUser(this.userId);
  }

  checkLoggedUser() {
    if (this.userId == 'miperfil' && !this.authService.isLoggedIn()){
      this.navCtrl.navigateRoot('/users/login');
    }
  }

  handleRefresh(event) {
    this.getUser(this.userId)
  };

  switchInformation(){
    this.information=true;
    this.publication=false;
  }
  switchPublication(){
    this.information=false;
    this.publication=true;
  }



  getUser(id){
   
    if (this.perfilLogeado()){
      this.usuariosService.obtenerMiPerfil().subscribe(res => {
        //console.log(res)
        this.user = res as Usuario;
        // si empieza con http / https es un link, sino agregarselo
        if (this.user.link_donacion && !this.user.link_donacion.startsWith('http')) {
          this.user.link_donacion = 'https://' + this.user.link_donacion;
        }
        // this.user.link_donacion = this.user.link_donacion.startsWith('http') ? this.user.link_donacion : 'https://' + this.user.link_donacion;
        // si no arranca con www agregarlo 
      });
      this.publicacionesService.obtenerMisPublicaciones().subscribe((data) => {
        //console.log(data)
        this.publicaciones = (data as Array<Publicacion>);
        this.publicaciones.forEach((e)=>{ e.visible=true; this.cant_publicaciones[e.tipo]++; });
        //console.log(this.publicaciones);
        const refresher = document.getElementById("refresher") as HTMLIonRefresherElement
        refresher.complete()
      });

      //TODO BUSCAR MIS MASCOTAS
      
    }else{
      this.usuariosService.obtenerUsuario(id).subscribe(res => {
        //console.log(res)
        this.user = res as Usuario;
        if (this.user.link_donacion && !this.user.link_donacion.startsWith('http')) {
          this.user.link_donacion = 'https://' + this.user.link_donacion;
        }

        this.publicaciones = this.user.publicaciones;
        this.publicaciones.forEach((e)=>{ e.visible=true; this.cant_publicaciones[e.tipo]++; });
        const refresher = document.getElementById("refresher") as HTMLIonRefresherElement
        refresher.complete()
      });
      
    }
  }


  detallePublicacion(tipo,id){
    this.navCtrl.navigateForward('/publicacion-detalle/'+tipo+'/'+id);
  }

  perfilLogeado(){
    return  this.authService.isLoggedIn() && (this.userId == 'miperfil' || this.userId == this.userLogged["id"]);
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Se copio el perfil al portapapeles',
      duration: 3000,
      position: 'bottom',
      color: 'beta'
    });

    await toast.present();
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: MenuPerfilComponent,
      event: ev,
      translucent: true,
      componentProps: {
       perfilLogeado : this.perfilLogeado(),
       userId : this.perfilLogeado() ? this.userLogged["id"] : this.userId,
       onClick: () => {
          popover.dismiss();
       },
      }

    });


    return await popover.present();
  }

  async openMap() {
    const modal = await this.modalCtrl.create({
      component: MapModalComponent,
      componentProps: {
        editable: false,
        paramMarker: [this.user.geo_lat,this.user.geo_long],
        isUser : true
      }
    });
    modal.present();

  }

}
