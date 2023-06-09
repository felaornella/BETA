import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { Usuario } from 'src/app/models/Usuario';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  user:Usuario = new Usuario();
  password:string = '';
  constructor(
    private navCtrl : NavController,
    private toastController: ToastController,
    private authService : AuthService) { 
    this.user.es_organizacion = false;
   }

  ngOnInit() {
    //console.log(this.user);
    this.user.es_organizacion=true
  }

  register(){
    this.authService.register(this.user,this.password).subscribe(res => {
      this.authService.setCurrentToken(res)
      this.authService.setUserInfo(res)
      this.presentToast(res["user_info"]["nombre"])
      this.navCtrl.navigateRoot("/home")
    },
    error => {
      this.presentErrorToast(error.error.msg)
    });

  }

  async presentToast(nombre) {
    const toast = await this.toastController.create({
      message: '¡Bienvenido/a ' + nombre + '!',
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
