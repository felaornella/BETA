import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { flatMap, map } from 'rxjs/operators';
import { getUrlImg } from 'src/app/utils/utils';
import { LoadingController, NavController, PopoverController, ToastController } from '@ionic/angular';
import { Pet } from '../../models/Pet';
import { MascotasService } from '../../services/mascotas/mascotas.service';
import { MenuMascotaComponent } from 'src/app/components/menu-mascota/menu-mascota/menu-mascota.component';
import { AuthService } from 'src/app/services/auth/auth.service';
@Component({
  selector: 'app-mi-mascota-detalle',
  templateUrl: './mi-mascota-detalle.page.html',
  styleUrls: ['./mi-mascota-detalle.page.scss'],
})
export class MiMascotaDetallePage implements OnInit {
  getUrlImg = getUrlImg;

  idMascota = ""
  mascota: Pet = new Pet;
  userLogged: any;
  userId: any;
  loggedIn: boolean= false;
  isOpenModalDelete: boolean= false;

  constructor(
    private loadingCtrl: LoadingController,
    private popoverController: PopoverController,
    private authService : AuthService,
    public route: ActivatedRoute,
    public navCtrl: NavController,
    private service: MascotasService,
    private toastController: ToastController
  ) { 
    route.params.subscribe((params)=>{
      this.idMascota = params["mascotaId"]
    })
    
  }

  ngOnInit() {
    this.loggedIn = this.authService.isLoggedIn()
    
    if (!this.loggedIn){
      this.navCtrl.back()
    }
    this.obtenerMascota()
  }
  
  obtenerMascota(){
    this.service.obtenerMascota(this.idMascota).subscribe((data)=>{
      this.mascota = (data as Pet)
      //console.log(this.mascota)
      if (this.mascota.enabled == false){
        this.navCtrl.navigateRoot("/mis-mascotas")
      }
    }, 
    (error) => {
      if (error.error.msg){
        this.presentToast(error.error.msg, "danger")
      }else {
        this.presentToast("Error al obtener mascota", "danger")
      }
      this.navCtrl.navigateRoot("/mis-mascotas")
      
    })
  }

  back(){
    this.navCtrl.navigateRoot("/mis-mascotas")
  }

  editar(){
    this.navCtrl.navigateRoot("/edit-mascota/" + this.mascota["id"])
  }

  async eliminar(){
    const loading = await this.loadingCtrl.create({
      message: 'Procesando',
      duration: 15000,
      spinner:  "dots",
      translucent: true,
      cssClass: 'custom-loading'
    });

    loading.present();
    this.service.eliminar(this.idMascota).subscribe(
      (response) => {
        setTimeout( ()=> {
          loading.dismiss();
          this.presentToast("Mascota Eliminada")
          const modal = document.getElementById("modalEliminar") as HTMLIonModalElement
          modal.dismiss()
          this.navCtrl.navigateRoot("/mis-mascotas")
        }, 1000)
      }, (error) => {
        setTimeout( ()=> {
          loading.dismiss();
          this.presentToast("Error al eliminar mascota", "danger")
        }, 1000)
      }
    )
  }

  obtenerQRMascota(){
    this.service.obtenerQRMascota(this.idMascota)
    this.presentToast("Codigo QR descargado")
  }

  mostrarQRNewOwner(){
    this.service.mostrarQRNewOwner(this.idMascota).subscribe(
      (response) => {
        const base64 = response["base64"]
        const imgElement = document.getElementById('imgQRNewOwner') as HTMLImageElement;
        if (imgElement) {
          imgElement.src = `data:image/jpeg;base64,${base64}`;
        }else{
          //console.log("NO")
        }
      })
    return true
  }

  async presentToast(message: string,color = 'beta') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color
    });

    await toast.present();
  }


  async presentMenu(ev: any) {
    const popover = await this.popoverController.create({
      component: MenuMascotaComponent,
      event: ev,
      translucent: true,
      componentProps: {
       perfilLogeado : this.loggedIn,
       mascotaId : this.idMascota,
       onClick: () => {
          popover.dismiss();
       },
       delete: () => {
        this.isOpenModalDelete = true
        },
      }

    });


    return await popover.present();
  }
}
