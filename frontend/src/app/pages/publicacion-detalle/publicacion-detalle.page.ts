import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { MapModalComponent } from 'src/app/components/map-modal/map-modal.component';
import { MenuPublicacionComponent } from 'src/app/components/menu-publicacion/menu-publicacion.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { PublicacionesService } from 'src/app/services/publicaciones/publicaciones.service';
import { PublicacionDetalle } from '../../models/Publicacion';
// import getUrlImg
import { getUrlImg } from '../../utils/utils';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-publicacion-detalle',
  templateUrl: './publicacion-detalle.page.html',
  styleUrls: ['./publicacion-detalle.page.scss'],
})
export class PublicacionDetallePage implements OnInit {
  getUrlImg = getUrlImg;
  idPublicacion: string;
  tipoPublicacion: string;
  imagenPublicacion: string;
  imagenPublicador: string;
  headerColor: string;
  headerTitle: string;
  // publicacion: PublicacionDetalle = new PublicacionDetalle;
  publicacion;

  cambioEstado = false

  constructor(
    private authService : AuthService,
    private popoverController: PopoverController,
    private modalCtrl: ModalController,
    public route: ActivatedRoute,
    public navCtrl: NavController,
    private p_service: PublicacionesService,
    private utils: UtilsService,
    private router: Router
  ) { 
    route.params.subscribe((params)=>{
      this.idPublicacion = params["publicationId"]
      this.tipoPublicacion = params["tipoPublicacion"]
      this.setPublicacion()
    })

    
  }

  ngOnInit() {
  }

  defaultBack(){
    if (this.tipoPublicacion == "1" || this.tipoPublicacion == "2"){
      return "/home/perdidos-y-encontrados"
    }else{
      return "/home/adopcion-y-transito"
    }
  }

  back(){
    let lv = this.utils.getUltimasURL() 
    let url_red = null

    for (let i=lv.length - 1; i>=0; i--){
      if( lv[i] == "/perfil/miperfil" ||
          (this.authService.getUserInfo() && lv[i] == `/perfil/${this.authService.getUserInfo()["id"]}`) ||
          lv[i] == "/home/perdidos-y-encontrados" ||
          lv[i] == "/home/adopcion-y-transito" ||
          lv[i] == "/map"  ){
          
            url_red = lv[i]
            break;
      }
    }
    //console.log("lv: ",lv)
    //console.log("url_red: ",url_red)
    if (url_red == null) {
      if (this.tipoPublicacion == "1" || this.tipoPublicacion == "2"){
        this.navCtrl.navigateRoot("/home/perdidos-y-encontrados")
        return false
      }else{
        this.navCtrl.navigateRoot("/home/adopcion-y-transito")
        return false
      } 
    }

    if (this.cambioEstado || lv[lv.length - 2].includes("/new-publicacion?tipoPublicacion=") || lv[lv.length - 2].includes("/edit-publicacion/")){
      //console.log("lv[lv.length - 2 ]: ", lv[lv.length - 2])
      //console.log("this.cambioEstado: ", this.cambioEstado)
        this.navCtrl.navigateRoot(url_red + "?reload=true")
        return false

    }else{
      this.navCtrl.back()
      return false
    }
  }
  
  setPublicacion(){
    switch (this.tipoPublicacion){
      case "1":
        this.headerColor= "var(--ion-color-perdidos)"
        this.headerTitle= "PERDIDO"
        break
      case "2":
        this.headerColor= "var(--ion-color-encontrados)"
        this.headerTitle= "ENCONTRADO"
        break
      case "3": 
        this.headerColor= "var(--ion-color-adopcion)"
        this.headerTitle= "ADOPCIÓN"
        break
      case "4":
        this.headerColor= "var(--ion-color-transito)"
        this.headerTitle= "TRÁNSITO"
        break
      default: 
          alert('Ocurrio un problema');
    }
    this.obtenerDataPublicaciones();
  }

  async openMap() {
    const modal = await this.modalCtrl.create({
      component: MapModalComponent,
      componentProps: {
        editable: false,
        paramMarker: [this.publicacion.geo_lat,this.publicacion.geo_long],
        typePublication: this.tipoPublicacion,
        typePet: this.publicacion.tipo_mascota_id ? parseInt(this.publicacion.tipo_mascota_id.toString()) : 0,
     }
    });
    modal.present();

  }

  obtenerDataPublicaciones(){
    this.p_service.obtenerPublicacion(this.idPublicacion).subscribe((data)=>{
      if (data == null){
        this.navCtrl.back()
      }
      this.publicacion = data as PublicacionDetalle;
    })
  }

  openPerfil(){
    if (this.publicacion.publicador.id){
      this.navCtrl.navigateForward("/perfil/"+this.publicacion.publicador.id)
    }else{
      //console.log("Usuario anonimo")
    }
  }

  expandImage(){
    alert("Imagen")
  }

  contact(){
    alert("Datos de contacto")
  }

  esElPublicador(){
    return this.authService.isLoggedIn() && this.publicacion.publicador.id == this.authService.getUserInfo()['id']
  }


  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: MenuPublicacionComponent,
      event: ev,
      translucent: true,
      componentProps: {
       perfilLogeado : this.esElPublicador(),
       publicacionId : this.publicacion.id,
       estadoGeneral: this.publicacion.estadoGeneral,
       tipoPublicacion: this.tipoPublicacion,
       vencida: this.publicacion.vencida,
       updateEstado: (estado) => {
        this.publicacion.estadoGeneral = estado
        this.cambioEstado = true
       },
       eliminar:() =>{
        this.cambioEstado = true
        this.back()
       },
       onClick: () => {
          popover.dismiss();
       },
       
      }

    });


    return await popover.present();
  }
}
