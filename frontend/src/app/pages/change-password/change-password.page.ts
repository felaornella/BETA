import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { Color } from 'src/app/models/Color';
import { Usuario } from 'src/app/models/Usuario';
import { UsuariosService } from 'src/app/services/usuarios/usuarios.service';
import { getUrlImg } from 'src/app/utils/utils';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit {
  getUrlImg = getUrlImg
  user: Usuario;
  actualPassword='';
  newPassword='';
  duplicatedNewPassword='';
  mensaje_error= null;
  constructor(
    private toastController: ToastController,
    private usuariosService: UsuariosService,
     public navCtrl: NavController,
     private loadingCtrl: LoadingController) {
  }

  ngOnInit() {
    this.getUser();
  }
  
  getUser(){
    this.usuariosService.obtenerMiPerfil().subscribe(res => {
      this.user = res as Usuario;      
    });
  }

  async guardar() {
    this.mensaje_error= null;
    if (this.actualPassword == ''){
      this.presentErrorToast("La contraseña actual es obligatoria");
      return;
    }
    if (this.newPassword == ''){
      this.presentErrorToast("La nueva contraseña es obligatoria");
      return;
    }
    if (this.duplicatedNewPassword == ''){
      this.presentErrorToast("Debe repetir la nueva contraseña");
      return;
    }

    if(this.newPassword == this.duplicatedNewPassword){
      const loading = await this.loadingCtrl.create({
        message: 'Procesando',
        duration: 15000,
        spinner:  "dots",
        translucent: true,
        cssClass: 'custom-loading'
      });
  
      loading.present();
      this.usuariosService.actualizarPassword(this.actualPassword,this.newPassword,this.duplicatedNewPassword).subscribe(res => {
        setTimeout( ()=> {
          loading.dismiss();
          this.navCtrl.navigateBack('/perfil/miperfil');
          this.presentToast();
        }, 1000);
      },
      error => {
        setTimeout( ()=> {
          loading.dismiss();
          this.presentErrorToast(error.error.msg);
        }, 1000);
      });

    }else{
      this.presentErrorToast("Las contraseñas no coinciden");
    }
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Se actualizo la contraseña correctamente',
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
      color: 'danger'
    });

    await toast.present();
  }

}
