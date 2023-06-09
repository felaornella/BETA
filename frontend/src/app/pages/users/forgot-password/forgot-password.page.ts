import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  email = '';

  constructor(private authService: AuthService,
    private toastController: ToastController,
    private navCtrl: NavController,
     ) { }

  ngOnInit() {
  }

  recuperar(){
    if (this.email == ''){
      this.presentErrorToast('Por favor, ingrese un correo electrónico')
      return
    }

    this.authService.forgotMyPassword(this.email).subscribe(res => {
      this.presentToast(res["msg"])
    },
    error => {
      this.presentErrorToast(error.error.msg)
    });
  }

  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 5000,
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
