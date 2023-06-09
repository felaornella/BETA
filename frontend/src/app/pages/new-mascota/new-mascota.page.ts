import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { MascotasService } from '../../services/mascotas/mascotas.service';
import { UtilsService } from '../../services/utils/utils.service';
import { Color, ListadoColoresDTO } from '../../models/Color';
import { ListadoRazasDTO, Raza } from '../../models/Raza';
import { Pet } from '../../models/Pet';
import { getUrlImg } from '../../../app/utils/utils';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-new-mascota',
  templateUrl: './new-mascota.page.html',
  styleUrls: ['./new-mascota.page.scss'],
})
export class NewMascotaPage implements OnInit {
  getUrlImg = getUrlImg;
  
  edadTipo = 1
  months  = [1,2,3,4,5,6,7,8,9,10,11,12]
  years   = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
  tipos = []
  razas: Raza[] = []
  colores: Color[] = []
  mascota: Pet = new Pet
  local_tipo_mascota_id = "";
  local_raza_mascota_id = "";
  local_colores: string[] = [];
  local_castracion = "";

  constructor(    
    private service: MascotasService,
    private utilsService: UtilsService,
    private toastController: ToastController,
    public navCtrl: NavController,
    private loadingCtrl: LoadingController
    ) { }

  ngOnInit() {
    // this.prepareNewPetSide()
    // this.obtenerRazas()
    this.obtenerColores()
    this.obtenerTipos()

    let hoy = new Date()
    this.mascota.fecha_nacimiento = hoy.getFullYear() + "-" + hoy.getMonth() + 1 + "-" + hoy.getDate()
  }

  obtenerRazas(){
    this.utilsService.obtenerRazas().subscribe((data) => {
      this.razas = (data as ListadoRazasDTO).razas;
    });
  }

  obtenerTipos(){
    this.utilsService.obtenerTipos().subscribe((data) => {
      this.tipos = data["tipos"]
    });
  }

  obtenerRazasPorTipo(){
    this.utilsService.obtenerRazasPorTipo(this.local_tipo_mascota_id).subscribe((data) => {
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

  placeName(){
    var fileInput = document.getElementById("imagen_mascota") as HTMLInputElement;
    var fileName = document.getElementById("nombreImg");
    var filePreview = document.getElementById("previewImg") as HTMLImageElement;

    if (fileName && fileInput) {
      let reader = new FileReader()
      reader.onload = () => {
        filePreview.src = String(reader.result)
      }
      reader.readAsDataURL(fileInput.files[0]);
      fileName.textContent = fileInput.files ? fileInput.files[0].name : "";
    }
  }

  async enviarMascota(){
    this.mascota.castracion = this.local_castracion != "" ? this.local_castracion == "true" : null
    this.mascota.raza_mascota_id = this.local_raza_mascota_id != "" ? parseInt(this.local_raza_mascota_id): null
    this.mascota.tipo_mascota_id = this.local_tipo_mascota_id != "" ? parseInt(this.local_tipo_mascota_id) : null
    if (!this.validacionCampos()) {
      return false;
    }

    const input = document.querySelector('#imagen_mascota') as HTMLInputElement
    let file_elegido = (input.files != null) ? input.files[0] : null

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

    const loading = await this.loadingCtrl.create({
      message: 'Procesando',
      duration: 15000,
      spinner:  "dots",
      translucent: true,
      cssClass: 'custom-loading'
    });

    loading.present();
    
    this.service.crearMascota(this.mascota,file_elegido).subscribe((data)=>{
      this.presentToast()
      setTimeout( ()=> {
        loading.dismiss();
        this.navCtrl.navigateRoot("/mi-mascota-detalle/" + data["id"])

      }, 1000)
    } , (error) => {
      setTimeout( ()=> {
        loading.dismiss();
        this.presentToastError(error.error.msg)
      }, 1000)
    })
    
  }


  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Mascota agregada con exito',
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


   // validarCampos pero ahora mejorando el mensaje de error
   validacionCampos(){
    let camposRequeridos = ["tipo_mascota_id","nombre","fecha_nacimiento","raza_mascota_id","colores","size","sexo","castracion","vacunacion"]
    
    const camposNombres = {
      "nombre": "nombre",
      "edad": "edad",
      "fecha_nacimiento": "fecha de nacimiento",
      "colores": "colores",
      "size": "tamaño",
      "sexo": "sexo",
      "tipo_mascota_id": "tipo de la mascota",
      "raza_mascota_id": "raza de la mascota",
      "castracion": "castracion",
      "vacunacion": "vacunacion",
    }
    
    let error = false
    let mensaje = ""
    for (let i = 0; i < camposRequeridos.length; i++) {
      if (this.mascota[camposRequeridos[i]] === "" || this.mascota[camposRequeridos[i]] === null || this.mascota[camposRequeridos[i]] === undefined || (Array.isArray(this.mascota[camposRequeridos[i]]) && this.mascota[camposRequeridos[i]].length === 0)){
        error = true
        mensaje = "Por favor complete el campo " + camposNombres[camposRequeridos[i]]
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
