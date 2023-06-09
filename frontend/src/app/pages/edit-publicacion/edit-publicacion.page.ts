import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
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

@Component({
  selector: 'app-edit-publicacion',
  templateUrl: './edit-publicacion.page.html',
  styleUrls: ['./edit-publicacion.page.scss'],
})
export class EditPublicacionPage implements OnInit {
  getUrlImg = getUrlImg
  newPet = true
  typeButtons = true
  
  months  = [1,2,3,4,5,6,7,8,9,10,11,12]
  years   = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]
  
  tipos = []
  razas: Raza[] = []
  colores: Color[] = []
  ubicacionActual= false
  mapaStarter: number[]
  loggedIn = false
  hide_spinner = false
  
  mascotas: any[] = []
  
  mascotaSeleccionada = 0
  
  nombreImg: string
  tipoPublicacion: string
  idPublicacion: string
  publicacion: PublicacionDetalle = new PublicacionDetalle
  sinPlaca= false
  edadTipo = "1"
  ubicacion: number[];
  local_tipo_mascota_id = "";
  local_raza_mascota_id = "";
  local_colores: string[] = [];
  local_castracion = "";
  local_retuvo= false;
  local_contacto_anonimo = "";
  local_imagen: any;
  local_edad: string;

  local_imagen_camara= false;
  local_imagen_camara_preview: any;


  constructor(
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    public navCtrl: NavController,
    private router: Router,
    public route: ActivatedRoute,
    private toastController: ToastController,
    private alertController: AlertController,
    private authService: AuthService,
    private utilsService: UtilsService,
    private usuariosService: UsuariosService,
    private publicacionesService: PublicacionesService,
    private camera: Camera,
    private file: File
  ) {
  }

  ngOnInit() {
    this.loggedIn = this.authService.isLoggedIn()
    
    if (!this.loggedIn){
      this.navCtrl.back()
    }
      
    this.route.params.subscribe((params)=>{
      this.idPublicacion = params["publicacionId"]
      this.prepareOwnPetSide()
      this.prepareNewPetSide()
      this.obtenerPublicacion()
    })
  }


  prepareNewPetSide(){
      this.obtenerTipos()
      this.obtenerColores()
    // this.obtenerRazas()
  }

  prepareOwnPetSide(){
    this.usuariosService.misMascotas().subscribe((data)=>{
      // this.hide_spinner = true
      this.hide_spinner = true
      this.mascotas = this.mascotas.concat(data)
    })
  }

  obtenerPublicacion(){
    this.publicacionesService.obtenerPublicacion(this.idPublicacion).subscribe((data)=>{
      this.publicacion = data as PublicacionDetalle;

      if (this.publicacion.publicador.id != this.authService.getUserInfo()["id"]){
        this.presentToastError("Permiso de edicion denegado")
        this.navCtrl.back()
      }

      this.tipoPublicacion = String(this.publicacion.tipo)
      
      if (this.publicacion.mascota_id == null || this.publicacion.mascota_id == undefined){
        this.newPet = true
      }else{
        this.mascotaSeleccionada = parseInt(this.publicacion.mascota_id)
        this.newPet = false
      }

      if (this.publicacion.nombre == "---"){
        this.sinPlaca = true
        this.publicacion.nombre = ""
      }

      if (this.publicacion.edad_unidad  == "años"){
        this.edadTipo = "1"
      }else{
        this.edadTipo = "2"
      }
      
      this.nombreImg = this.publicacion.nombre + ".jpg"
      this.local_imagen = getUrlImg(this.publicacion.imagen)
      this.ubicacion = [this.publicacion.geo_lat, this.publicacion.geo_long]
      this.local_tipo_mascota_id = String(this.publicacion.tipo_mascota_id)
      this.local_retuvo = this.publicacion.retuvo
      this.local_edad = String(this.publicacion.edad)
      this.local_castracion = this.publicacion.castracion ? "true" : "false"
      this.obtenerRazas()
    })
  }

  obtenerRazas(){
    this.utilsService.obtenerRazasPorTipo(this.local_tipo_mascota_id).subscribe((data) => {
      this.razas = (data as ListadoRazasDTO).razas;
      this.local_raza_mascota_id = String(this.publicacion.raza_mascota_id)
    });
  }

  obtenerTipos(){
    this.utilsService.obtenerTipos().subscribe((data) => {
      this.tipos = data["tipos"];
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
        console.error(error);
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
    this.navCtrl.navigateRoot("/publicacion-detalle/"+this.tipoPublicacion+"/"+this.idPublicacion)
  }

  seleccionarMascota(id){
    if (this.mascotaSeleccionada != id){
      this.mascotaSeleccionada = id
    }else{
      this.mascotaSeleccionada = 0;
    }
  }

  toggleUbicacionActual(){
    this.getGeoPosition();
  }

  switchType(){
    if (this.publicacion.mascota_id != null && this.publicacion.mascota_id != undefined){
      this.presentToastError("Las publicaciones creadas desde 'Mis Mascotas' solo pueden editarse desde 'Mis Mascotas'")
    }else{
      this.newPet=!this.newPet
    }
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

  getGeoPosition(){
    const onSuccess = (position) => {
      if (this.ubicacionActual){
        this.ubicacion = [position.coords.latitude, position.coords.longitude];
        this.mapaStarter = [position.coords.latitude, position.coords.longitude];
      }else{
        this.ubicacion = []
      }
    };

    // onError Callback receives a PositionError object
    //
    const onError = (error) => {};

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  }

  async enviarPublicacion(){
    this.publicacion.edad = parseInt(this.local_edad)
    this.publicacion.tipo_mascota_id = parseInt(this.local_tipo_mascota_id)
    this.publicacion.raza_mascota_id = parseInt(this.local_raza_mascota_id)
    this.publicacion.retuvo = this.local_retuvo
    this.publicacion.castracion = this.local_castracion == "true" ? true : false
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
        if (file_elegido != null && file_elegido != undefined){
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

      this.publicacionesService.actualizarPublicacion(this.publicacion,file_elegido,null,this.idPublicacion).subscribe((data)=>{
        setTimeout( ()=> {
          loading.dismiss();
          this.presentToast()
          this.navCtrl.navigateRoot("/publicacion-detalle/"+this.tipoPublicacion+"/"+this.idPublicacion)
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
        this.presentToastError("Por favor seleccione una duración de transito")
        return false
      } 
      this.publicacionesService.actualizarPublicacion(this.publicacion,file_elegido,this.mascotaSeleccionada,this.idPublicacion).subscribe((data)=>{
        this.presentToast()
        this.navCtrl.navigateRoot("/publicacion-detalle/"+this.tipoPublicacion+"/"+this.idPublicacion)
      },error => {
        this.presentToastError(error.error.msg);
      })
    }


  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Publicacion actualizada con exito',
      duration: 3000,
      position: 'bottom',
      color: 'beta',
      icon: 'checkmark-circle-outline'
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


