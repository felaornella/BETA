import { Component, Input, OnInit } from '@angular/core';
import { NavController, ToastController, Platform, LoadingController, IonicModule  } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { PublicacionesService } from 'src/app/services/publicaciones/publicaciones.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-menu-publicacion',
  templateUrl: './menu-publicacion.component.html',
  styleUrls: ['./menu-publicacion.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class MenuPublicacionComponent implements OnInit {
  @Input() public perfilLogeado = false;
  @Input() public publicacionId;
  @Input() public estadoGeneral;
  @Input() public vencida;
  @Input() public tipoPublicacion;
  @Input() public updateEstado;
  @Input() public eliminar;
  @Input() public onClick = () => {}

  constructor(public navCtrl: NavController,
      private toastController: ToastController,
      private platform: Platform,
      private socialSharing: SocialSharing,
      private publicacionesServices: PublicacionesService,
      private utils: UtilsService,
      private loadingCtrl: LoadingController
  ) { }
  ngOnInit() {
  
  }

  async sharePublicacion() {
    let message = "🚨 ¡Compartir es ayudar! 🚨 Te comparto la siguiente publicación de ";
    if (this.tipoPublicacion === '1') {
      message += "perdido";
    } else if (this.tipoPublicacion === '2') {
      message += "encontrado";
    } else if (this.tipoPublicacion === '3') {
      message += "adopción";
    } else if (this.tipoPublicacion === '4') {
      message += "tránsito";
    }
    message += " en BETA. Ayuda a compartir esta publicación para que más personas la vean y puedan ayudar. 🙏";
    const subject = "Publicacion de BETA";
    const url = environment.baseFrontUrl + "/publicacion-detalle/" + this.tipoPublicacion + "/" + this.publicacionId;

    if (this.platform.is('cordova')) {
      this.socialSharing.share(message, subject, undefined, url);
    } else {
      try {
        await navigator.clipboard.writeText(message + "\n" + url);
        this.presentToast('Se copió el mensaje al portapapeles 📋');
      } catch (err) {
        // Fallback para navegadores más antiguos
        const textArea = document.createElement("textarea");
        textArea.value = message + " " + url;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          this.presentToast('Se copió el mensaje al portapapeles');
        } catch (err) {
          this.presentToast('No se pudo copiar al portapapeles');
        }
        document.body.removeChild(textArea);
      }
    }
    this.onClick();
  }


  editPublicacion(){
    this.onClick()
    if (this.perfilLogeado){
      this.navCtrl.navigateRoot("/edit-publicacion/" + this.publicacionId)
    }
  }

  async pausarPublicacion(){
    this.onClick()
    const modal = document.getElementById("modalPausar") as HTMLIonModalElement
    modal.dismiss()
    if (this.perfilLogeado){
      const loading = await this.loadingCtrl.create({
        message: 'Procesando',
        duration: 15000,
        spinner:  "dots",
        translucent: true,
        cssClass: 'custom-loading'
      });
  
      loading.present();
      this.publicacionesServices.pausarPublicacion(this.publicacionId).subscribe((data)=>{
        setTimeout( ()=> {
          loading.dismiss();
          this.presentToast("Publicacion Pausada")
          this.updateEstado(2)
        }, 1000)
      })
    }
  }

  async reanudarPublicacion(){
    this.onClick()
    const modal = document.getElementById("modalReanudar") as HTMLIonModalElement
    modal.dismiss()
    if (this.perfilLogeado){
      const loading = await this.loadingCtrl.create({
        message: 'Procesando',
        duration: 15000,
        spinner:  "dots",
        translucent: true,
        cssClass: 'custom-loading'
      });
  
      loading.present();
      this.publicacionesServices.reanudarPublicacion(this.publicacionId).subscribe((data)=>{
        setTimeout( ()=> {
          loading.dismiss();
          this.presentToast("Publicacion Reanudada")
          this.updateEstado(1)
        }, 1000)
      })
    }
  }

  async finalizarPublicacion(){
    this.onClick()
    const modal = document.getElementById("modalFinalizar") as HTMLIonModalElement
    modal.dismiss()
    if (this.perfilLogeado){
      const loading = await this.loadingCtrl.create({
        message: 'Procesando',
        duration: 15000,
        spinner:  "dots",
        translucent: true,
        cssClass: 'custom-loading'
      });
  
      loading.present();
      this.publicacionesServices.finalizarPublicacion(this.publicacionId).subscribe((data)=>{
        setTimeout( ()=> {
          loading.dismiss();
          this.presentToast("Publicacion Finalizada")
          this.updateEstado(3)
        }, 1000)
      })
    }
  }

  async eliminarPublicacion(){
    this.onClick()
    const modal = document.getElementById("modalEliminar") as HTMLIonModalElement
    modal.dismiss()
    if (this.perfilLogeado){
      const loading = await this.loadingCtrl.create({
        message: 'Procesando',
        duration: 15000,
        spinner:  "dots",
        translucent: true,
        cssClass: 'custom-loading'
      });
  
      loading.present();
      this.publicacionesServices.eliminarPublicacion(this.publicacionId).subscribe((data)=>{
        setTimeout( ()=> {
          loading.dismiss();
          this.presentToast("Publicacion Eliminada")
          this.eliminar()
        }, 1000)
      })
    }
  }


  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      position: 'bottom',
      color: 'beta'
    });

    await toast.present();
  }

  pausarPublicacionModal(){
    const modal = document.getElementById("modalPausar") as HTMLIonModalElement
    modal.present()
  }
  finalizarPublicacionModal(){
    const modal = document.getElementById("modalFinalizar") as HTMLIonModalElement
    modal.present()
  }
  reanudarPublicacionModal(){
    const modal = document.getElementById("modalReanudar") as HTMLIonModalElement
    modal.present()
  }
  eliminarPublicacionModal(){
    const modal = document.getElementById("modalEliminar") as HTMLIonModalElement
    modal.present()
  }
  
  
}
