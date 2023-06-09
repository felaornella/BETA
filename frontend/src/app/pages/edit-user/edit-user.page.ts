import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { MapModalComponent } from 'src/app/components/map-modal/map-modal.component';
import { Usuario } from 'src/app/models/Usuario';
import { UsuariosService } from 'src/app/services/usuarios/usuarios.service';
import { getUrlImg } from 'src/app/utils/utils';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.page.html',
  styleUrls: ['./edit-user.page.scss'],
})
export class EditUserPage implements OnInit {
  getUrlImg = getUrlImg;
  user: Usuario;
  userId: string;

  file: any;
  img_new: any;
  ubicacion: number[] = [];
  constructor(private modalCtrl: ModalController,
    private toastController: ToastController,
    private usuariosService: UsuariosService,
    public activatedRoute: ActivatedRoute,
     public navCtrl: NavController,
     private loadingCtrl: LoadingController) {
    //this.userId = this.activatedRoute.snapshot.paramMap.get('userId');  // TODO CAMBIARLO PARA QUE NO LO TOME DE LA URL SINO DE LA SESION
  }

  ngOnInit() {
    this.getUser();
  }
  async guardar() {
    if (this.validacionCampos() && this.validarDatoContactos()){
      const input = document.querySelector('#imagen_perfil') as HTMLInputElement
      let file_elegido = (input.files != null) ? input.files[0] : null


      if (file_elegido != null && file_elegido != undefined){
        if(file_elegido.type != "image/jpeg" && file_elegido.type != "image/jpg" && file_elegido.type != "image/png"){
          this.presentErrorToast("Por favor seleccione una imagen JPG o PNG")
          return false
        }else{
          if (file_elegido.size > (8 * 1024 * 1024)){
            this.presentErrorToast("El tamaño maximo de foto es de 8 MB")
            return false  
          }
        }
      }
      
      const loading = await this.loadingCtrl.create({
        message: 'Procesando',
        duration: 15000,
        spinner:  "dots",
        translucent: true,
        cssClass: 'custom-loading'
      });
  
      loading.present();
      this.usuariosService.actualizarMiPerfil(this.user,file_elegido).subscribe(res => {
        setTimeout( ()=> {
          loading.dismiss();
          this.navCtrl.navigateRoot("/perfil/miperfil"); 
          this.presentToast();
        }, 1000)
         
      }, 
      error => {
        setTimeout( ()=> {
          loading.dismiss();
          this.presentErrorToast(error.error.msg);
        }, 1000)
      }
      );
    }
  }

  changeListener($event): void {
    this.file = $event.target.files[0];
    //console.log(this.file);
    let reader = new FileReader();
      reader.onload = ($event:any) => {
        this.img_new = $event.target.result;
      }
      reader.readAsDataURL($event.target.files[0]);
  }

  open_file_selector(){
    document.getElementById("imagen_perfil")?.click()
  }

  getUrlImgPerfil (id){
    if (this.img_new != null)
      return this.img_new;
    return getUrlImg(id);
  }

  getUser(){
    this.usuariosService.obtenerMiPerfil().subscribe(res => {
      this.user = res as Usuario;    
    });
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Se actualizo el perfil correctamente',
      duration: 3000,
      position: 'bottom',
      color: 'beta'
    });

    await toast.present();
  }

  async presentErrorToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      position: 'bottom',
      cssClass: 'custom-toast',
      color: 'danger',
      icon: 'close-circle-outline'
    });

    await toast.present();
  }

  validarDatoContactos() {
    if (this.user.email_visible || 
      (this.user.instagram_visible && this.user.instagram != '') ||
       this.user.telefono_visible && this.user.telefono != '') {
      return true;
    }
    this.presentErrorToast("Debe haber al menos 1 dato de contacto visible")
    return false;
  }


  // MAPA
   
  async openMap() {
    const modal = await this.modalCtrl.create({
      component: MapModalComponent,
      componentProps: {
        editable: true,
        paramMarker : [this.user.geo_lat,this.user.geo_long],
        isUser: true
     }
    });
    modal.present();

    const { data , role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      //console.log(data);
      this.user.geo_lat = data["lat"]
      this.user.geo_long = data["lng"];
    }

  }

  validacionCampos(){
    // Segun si es organizacion
    let camposRequeridosUsuario = ["nombre","apellido","fecha_nacimiento"]
    let camposRequeridosOrganizacion = ["nombre","fecha_creacion","dni_responsable","nombre_responsable","apellido_responsable","geo_lat","geo_long"]

    const camposNombres = {
      "nombre": "nombre",
      "apellido": "apellido",
      "edad": "edad",
      "fecha_nacimiento": "fecha de nacimiento",
      "fecha_creacion": "fecha de creacion",
      "dni_responsable": "dni del responsable",
      "nombre_responsable": "nombre del responsable",
      "apellido_responsable": "apellido del responsable",
      "geo_lat": "ubicacion",
      "geo_long": "ubicacion"
    }
    
    let error = false
    let mensaje = ""
    let camposRequeridos = (this.user.es_organizacion) ? camposRequeridosOrganizacion : camposRequeridosUsuario
    for (let i = 0; i < camposRequeridos.length; i++) {
      if (this.user[camposRequeridos[i]] === "" || this.user[camposRequeridos[i]] === null || this.user[camposRequeridos[i]] === undefined ){
        error = true
        mensaje = "Por favor complete el campo " + camposNombres[camposRequeridos[i]]
        break;
      }
    }
    if (error){
      this.presentErrorToast(mensaje)
      return false
    }else{
      return true
    }
  }
}

