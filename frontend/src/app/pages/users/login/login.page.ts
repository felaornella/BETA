import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/auth/auth.service';
import { UsuariosService } from '../../../services/usuarios/usuarios.service';
import { catchError, switchMap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email = "";
  password = "";
  mensaje_error = "";
  show_mensaje_error = false;

  constructor(
    private authService: AuthService,
    private service: UsuariosService,
    private toastController: ToastController,
    public navCtrl: NavController
  ) { }

  ngOnInit() {
  }

  jumpToHome(){
    if (this.email == ""){
      this.presentErrorToast("El email es obligatorio");
      return;
    }
    if (this.password == ""){
      this.presentErrorToast("La contraseña es obligatoria");
      return;
    }

    this.authService.login({email: this.email, password: this.password})
      .pipe(
        catchError((error) => {
          if ([401, 403].includes(error.status)) {
            if (this.authService.isLoggedIn()){
              // auto logout if 401 or 403 response returned from api
              this.authService.logout();
            }
            this.presentErrorToast(error.error.msg)
          }

          const err = (error && error.error && error.error.message) || error.statusText;
          return throwError(() => err);
        })
      )
      .subscribe((res) => {  
         // Check if in user info exists "Recuperar": true
        if (res["user_info"] && res["user_info"]["recuperacion"] == true) {
          res["user_info"]["temp"]=this.password;
          this.authService.setUserInfo(res)

          this.navCtrl.navigateRoot("/recuperar-password")
          return;
        }
          this.authService.setCurrentToken(res)
          this.authService.setUserInfo(res)
          this.presentToast(res["user_info"]["nombre"])
          this.navCtrl.navigateRoot("/home")
      })
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
