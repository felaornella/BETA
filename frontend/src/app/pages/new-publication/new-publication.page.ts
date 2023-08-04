import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController, NavController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { MapModalComponent } from '../../components/map-modal/map-modal.component';
import { AuthService } from '../../services/auth/auth.service';
import { UtilsService } from '../../services/utils/utils.service';
import { ListadoColoresDTO } from '../../models/Color';
import { ListadoRazasDTO } from '../../models/Raza';
import { Raza } from '../../models/Raza';
import { Color } from '../../models/Color';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { getUrlImg } from '../../utils/utils';
import { PublicacionDetalle } from '../../models/Publicacion';
import { PublicacionesService } from '../../services/publicaciones/publicaciones.service';
import { ToastController } from '@ionic/angular';
import { Camera, CameraOptions, PictureSourceType } from '@awesome-cordova-plugins/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { GpsUtilsService } from 'src/app/services/gps-utils/gps-utils.service';

@Component({
  selector: 'app-new-publication',
  templateUrl: './new-publication.page.html',
  styleUrls: ['./new-publication.page.scss'],
})
export class NewPublicationPage implements OnInit {
  getUrlImg = getUrlImg
  newPet = false
  typeButtons = true
  
  months  = [1,2,3,4,5,6,7,8,9,10,11,12]
  years   = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]
  
  tipos = []
  razas: Raza[] = []
  colores: Color[] = []
  ubicacionActual= true
  mapaStarter: number[]
  loggedIn = false
  hide_spinner = false
  
  mascotas: any[] = []
  
  mascotaSeleccionada = 0
  
  tipoPublicacion: string
  publicacion: PublicacionDetalle = new PublicacionDetalle()

  sinPlaca= false
  edadTipo = 1
  ubicacion: number[];


  local_imagen: any;
  local_imagen_camara= false;
  local_imagen_camara_preview: any;

  id_redirect_to: any;
  similares = [];
  alert= false
  slideOpts = {
    initialSlide: 0,
    speed: 400
  };

  constructor(
    private loadingCtrl: LoadingController,
    private gpsUtilsService: GpsUtilsService,
    private modalCtrl: ModalController,
    public navCtrl: NavController,
    private platform: Platform,
    private toastController: ToastController,
    private alertController: AlertController,
    private authService: AuthService,
    private utilsService: UtilsService,
    private usuariosService: UsuariosService,
    private publicacionesService: PublicacionesService,
    private camera: Camera,
    private file: File
  ) { }

  ngOnInit() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    this.tipoPublicacion = urlParams.get("tipoPublicacion");

    this.loggedIn =  this.authService.isLoggedIn();
    
    this.newPet = (this.tipoPublicacion == "2")

    if (!this.loggedIn && this.tipoPublicacion != "2"){
      this.navCtrl.back()
    }
    if (this.loggedIn){
      this.prepareOwnPetSide()
    }
    this.prepareNewPetSide()

    this.getGeoPosition(false)
  }


  prepareNewPetSide(){
    this.obtenerColores()
    this.obtenerTipos()
    // this.obtenerRazas()
  }

  prepareOwnPetSide(){
    this.usuariosService.misMascotas().subscribe((data)=>{
      // this.hide_spinner = true
      this.hide_spinner = true
      this.mascotas = this.mascotas.concat(data)
      //console.log(this.mascotas)
      if (this.mascotas.length == 0){
        this.newPet = true
      }
    })
  }

  obtenerTipos(){
    this.utilsService.obtenerTipos().subscribe((data) => {
      this.tipos = data["tipos"];
    });
  }

  obtenerRazas(){
    this.utilsService.obtenerRazasPorTipo(this.publicacion.tipo_mascota_id).subscribe((data) => {
      this.razas = (data as ListadoRazasDTO).razas;
    });
  }

  obtenerColores(){
    this.utilsService.obtenerColores().subscribe((data)=>{
      this.colores = (data as ListadoColoresDTO).colores;
    });
  }

  open_file_selector(){
      document.getElementById("imagen_mascota")?.click()
  }

  async takePicture(){
    if(this.platform.is('cordova')) {

      const options: CameraOptions = {
        quality: 85,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        saveToPhotoAlbum: true,
        correctOrientation: true
      }
      
      try {
          this.camera.getPicture(options).then((imageData) => {
            // Extract the base64 data by removing the "data:image/jpeg;base64," prefix
            const base64Data = imageData.replace("data:image/jpeg;base64,", "");

            // Use the atob() method to convert the base64 data to a binary string
            const binaryString = atob(base64Data);

            // Use the Uint8Array() method to convert the binary string to a byte array
            const byteArray = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                byteArray[i] = binaryString.charCodeAt(i);
            }

            // Create a Blob object from the byte array
            const blob = new Blob([byteArray], { type: "image/jpeg" });

            this.local_imagen = blob
            this.local_imagen_camara = true
            this.local_imagen_camara_preview = "data:image/jpeg;base64," + imageData
            this.placeName2(imageData)
          })
        
      } catch (error) {
          //console.log("hola");
      }
    }else {
      this.presentToast("Esta funcionalidad solo está disponible en la aplicación", "asociation", "alert-circle-outline")
    }
  }

  getPreviewImg(){
    if (this.local_imagen){
      if (this.local_imagen_camara){
        //console.log("Cam_prev: ", this.local_imagen_camara_preview)
        return this.local_imagen_camara_preview
      }else{
        //console.log("Local_prev: ", this.local_imagen)
        return this.local_imagen
      }
    }else{
      return ""
    }
  }
  
  placeName(){
    var fileInput = document.getElementById("imagen_mascota") as HTMLInputElement;
    var fileName = document.getElementById("nombreImg");
    var filePreview = document.getElementById("previewImg") as HTMLImageElement;

    if (fileName && fileInput) {
      let reader = new FileReader()
      reader.onload = () => {
        this.local_imagen = reader.result;
        this.local_imagen_camara = false;
      }
      reader.readAsDataURL(fileInput.files[0]);
      fileName.textContent = fileInput.files ? fileInput.files[0].name : "";
    }
  }

  placeName2(imageData){
    const today = new Date();
    const formattedDate = today.getFullYear() +
      (today.getMonth() + 1).toString().padStart(2, "0") +
      today.getDate().toString().padStart(2, "0") + "_" +
      today.getHours().toString().padStart(2, "0") +
      today.getMinutes().toString().padStart(2, "0") +
      today.getSeconds().toString().padStart(2, "0");

    var fileName = document.getElementById("nombreImg");
    var filePreview = document.getElementById("previewImg") as HTMLImageElement;
    
    
    if (fileName) {
      fileName.textContent = formattedDate + ".jpg";
    }
  }

  back(){
    this.navCtrl.navigateBack("/nueva-publicacion-menu")
  }

  seleccionarMascota(id){
    if (this.mascotaSeleccionada != id){
      this.mascotaSeleccionada = id;
    }else{
      this.mascotaSeleccionada = 0;
    }
  }

  toggleUbicacionActual(){
    if (this.ubicacionActual){
      this.getGeoPosition(true);  
    }
  }

  switchType(){
    this.newPet=!this.newPet
  }

  async openMap() {
    this.ubicacion = []
    
    const modal = await this.modalCtrl.create({
      component: MapModalComponent,
      componentProps: {
        editable: true,
        marker: this.mapaStarter,
        typePublication: this.tipoPublicacion,
        typePet: this.publicacion.tipo_mascota_id ? parseInt(this.publicacion.tipo_mascota_id.toString()) : 0,
     }
    });
    modal.present();

    const { data , role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      //console.log(data);
      this.ubicacion = [data["lat"],data["lng"]];
      this.mapaStarter = [data["lat"],data["lng"]];
      // Update data
    }else{
      this.ubicacion = [this.mapaStarter[0],this.mapaStarter[1]]
    }

  }

  getGeoPosition(required = false){
    const onSuccess = (position) => {
      if (this.ubicacionActual){
        this.ubicacion = position;
        this.mapaStarter = position;
      }else{
        this.ubicacion = []
      }
    };

    // onError Callback receives a PositionError object
    //
    const onError = () => {
      this.ubicacionActual = false;
      this.ubicacion = []
    };
    this.gpsUtilsService.getGeoPosition(onSuccess, onError, required, false);
  }

  async enviarPublicacion(){
    this.publicacion.tipo = parseInt(this.tipoPublicacion)
    if (this.newPet && !this.validacionCampos()){
      return false
    }

    if (!this.sinPlaca && this.tipoPublicacion == '2' && (this.publicacion.nombre == "" || this.publicacion.nombre == undefined)){
      this.presentToastError("Por favor complete el campo nombre de la mascota o seleccione la opción 'Sin placa identificadora'")
      return false
    }
    if (this.sinPlaca){
      this.publicacion.nombre = ""
    }

    if (this.ubicacion == undefined || this.ubicacion.length == 0){
      this.presentToastError("Por favor seleccione una ubicacion")
      return false
    }
    this.publicacion.geo_lat = this.ubicacion[0]
    this.publicacion.geo_long = this.ubicacion[1]
    

    let file_elegido = null
    if (this.newPet){
      const input = document.querySelector('#imagen_mascota') as HTMLInputElement
      let file_elegido = (input.files != null) ? input.files[0] : null

      if (this.local_imagen_camara){
        if (this.local_imagen == null || this.local_imagen == undefined ){
          this.presentToastError("Por favor seleccione una imagen")
          return false
        }else{
          if (this.local_imagen.type != "image/jpeg" && this.local_imagen.type != "image/jpg" ){
            this.presentToastError("Por favor seleccione una imagen JPG")
            return false  
          }else{
            if (this.local_imagen.size > (8 * 1024 * 1024)){
              this.presentToastError("El tamaño maximo de foto es de 8 MB")
              return false  
            }else{
              file_elegido = this.local_imagen
            }
          }
        }
      }else{
        if (file_elegido == null || file_elegido == undefined){
          this.presentToastError("Por favor seleccione una imagen")
          return false
        }else{
          if(file_elegido.type != "image/jpeg" && file_elegido.type != "image/jpg" && file_elegido.type != "image/png"){
            this.presentToastError("Por favor seleccione una imagen JPG o PNG")
            return false
          }else{
            if (file_elegido.size > (8 * 1024 * 1024)){
              this.presentToastError("El tamaño maximo de foto es de 8 MB")
              return false  
            }
          }

        }   
      }
      
      //console.log("ARCHIVO: ",file_elegido)
      const loading = await this.loadingCtrl.create({
        message: 'Procesando',
        duration: 15000,
        spinner:  "dots",
        translucent: true,
        cssClass: 'custom-loading'
      });
      loading.present();
      this.publicacionesService.crearPublicacion(this.publicacion,file_elegido,null).subscribe((data)=>{
        setTimeout( ()=> {
          loading.dismiss();
          if (data["cant_similares"] == 0){
            this.presentToast("Publicacion creada con exito")
            this.navCtrl.navigateRoot("/publicacion-detalle/"+this.tipoPublicacion+"/"+data["publicacion"]["id"])
          }else{
            this.id_redirect_to= data["publicacion"]["id"]
            this.similares = data["similares"]
            const modalPreCoincidencias = document.getElementById("modalPreCoincidencias") as HTMLIonModalElement
            modalPreCoincidencias.present()
          }
        }, 1000)
       
      },error => {
        setTimeout( ()=> {
          loading.dismiss();
          this.presentToastError(error.error.msg);
        }, 1000)
      })
    }else{
      if (this.mascotaSeleccionada == 0){
        this.presentToastError("Por favor seleccione una mascota")
        return false
      }
      if (this.publicacion.tipo == 4 && (this.publicacion.duracion_transito == '' || this.publicacion.duracion_transito == undefined) ) {
        this.presentToastError("Por favor seleccione una duración de tránsito")
        return false
      } 
      const loading = await this.loadingCtrl.create({
        message: 'Procesando',
        duration: 15000,
        spinner:  "dots",
        translucent: true,
        cssClass: 'custom-loading'
      });
      loading.present();
      this.publicacionesService.crearPublicacion(this.publicacion,file_elegido,this.mascotaSeleccionada).subscribe((data)=>{
        setTimeout( ()=> {
          loading.dismiss();
          if (data["new"]){
            if (data["cant_similares"] == 0){
              //this.presentToast()
              this.presentToast("Publicacion creada con exito")
              this.navCtrl.navigateRoot("/publicacion-detalle/"+this.tipoPublicacion+"/"+data["publicacion"]["id"])
            }else{
              this.id_redirect_to= data["publicacion"]["id"]
              this.similares = data["similares"]
              const modalPreCoincidencias = document.getElementById("modalPreCoincidencias") as HTMLIonModalElement
              modalPreCoincidencias.present()
            }
          }else{
            if (data["cant_similares"] == 0){
              this.presentAlert()
              this.navCtrl.navigateRoot("/publicacion-detalle/"+this.tipoPublicacion+"/"+data["publicacion"]["id"])
            }else{
              this.id_redirect_to= data["publicacion"]["id"]
              this.similares = data["similares"]  
              this.alert = true
              const modalPreCoincidencias = document.getElementById("modalPreCoincidencias") as HTMLIonModalElement
              modalPreCoincidencias.present()
            }
          }
        }, 1000)
        
      },error => {
        setTimeout( ()=> {
          loading.dismiss();
          this.presentToastError(error.error.msg);
        }, 1000)
      })
    }


  }

  rechazarSimilares(){
    const modalPreCoincidencias = document.getElementById("modalPreCoincidencias") as HTMLIonModalElement
    modalPreCoincidencias.dismiss()
    if (!this .alert){
      this.presentToast("Publicacion creada con exito")
    }else{
      this.presentAlert()
    }
    this.navCtrl.navigateRoot("/publicacion-detalle/"+this.tipoPublicacion+"/"+this.id_redirect_to)
  }

  aceptarSimilares(){
    const modalPreCoincidencias = document.getElementById("modalPreCoincidencias") as HTMLIonModalElement
    modalPreCoincidencias.dismiss()
    const modalCoincidencias = document.getElementById("modalCoincidencias") as HTMLIonModalElement
    modalCoincidencias.present()
  }

  abrirDetalleSimilar(id){
    const modalCoincidencias = document.getElementById("modalCoincidencias") as HTMLIonModalElement
    modalCoincidencias.dismiss()
    let tipoRedireccion = (this.tipoPublicacion == "2") ? 1 : 2
    this.navCtrl.navigateRoot("/publicacion-detalle/"+tipoRedireccion+"/"+id)
  }

  cerrarSimilares(){
    const modalCoincidencias = document.getElementById("modalCoincidencias") as HTMLIonModalElement
    modalCoincidencias.dismiss()
    if (!this .alert){
      this.presentToast("Publicacion creada con exito")
    }else{
      this.presentAlert()
    }
    this.navCtrl.navigateRoot("/publicacion-detalle/"+this.tipoPublicacion+"/"+this.id_redirect_to)
  }


  async presentToast(message, color = 'beta', icon = 'checkmark-circle-outline') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
      icon: icon
    });

    await toast.present();
  }

  async presentToastError(err) {
    const toast = await this.toastController.create({
      message: err,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      icon: 'close-circle-outline'
    });

    await toast.present();
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Oops..',
      subHeader: 'Ya existe una publicacion de este tipo para la mascota seleccionada.',
      message: 'No te preocupes, actualizamos la publicacion para que aparezca más arriba en los listados :)',
      buttons: ['OK'],
      backdropDismiss: false,
    });

    await alert.present();
  }


  // validarCampos pero ahora mejorando el mensaje de error
  validacionCampos(){
    let camposRequeridos = {
      "tipo": {
          "1": ["tipo_mascota_id","nombre","edad","edad_unidad","raza_mascota_id","colores","size","sexo"],
          "2": ["tipo_mascota_id","edad_estimada","raza_mascota_id","colores","size","sexo"],
          "3": ["tipo_mascota_id","nombre","edad","edad_unidad","raza_mascota_id","colores","size","sexo","castracion","vacunacion"],
          "4": ["tipo_mascota_id","nombre","edad","edad_unidad","raza_mascota_id","colores","size","sexo","castracion","vacunacion","duracion_transito"]
      }
    }
    const camposNombres = {
      "nombre": "nombre",
      "edad": "edad",
      "edad_unidad": "unidad de edad",
      "edad_estimada": "edad estimada",
      "colores": "colores",
      "size": "tamaño",
      "sexo": "sexo",
      "tipo_mascota_id": "tipo de la mascota",
      "raza_mascota_id": "raza de la mascota",
      "retuvo": "para saber si lo retuvo",
      "castracion": "castracion",
      "vacunacion": "vacunacion",
      "duracion_transito": "duracion del transito"
    }
    let campos = camposRequeridos["tipo"][this.tipoPublicacion]
    let error = false
    let mensaje = ""
    for (let i = 0; i < campos.length; i++) {
      //console.log(campos[i])
      //console.log(this.publicacion[campos[i]])
      if (this.publicacion[campos[i]] === "" || this.publicacion[campos[i]] === null || this.publicacion[campos[i]] === undefined || (Array.isArray(this.publicacion[campos[i]]) && this.publicacion[campos[i]].length === 0)){
        error = true
        mensaje = "Por favor complete el campo " + camposNombres[campos[i]]
        break;
      }
    }
    if (error){
      this.presentToastError(mensaje)
      return false
    }else{
      return true
    }
  }

  
}
