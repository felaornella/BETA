import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-recovery-password',
  templateUrl: './recovery-password.page.html',
  styleUrls: ['./recovery-password.page.scss'],
})
export class RecoveryPasswordPage implements OnInit {
  newPassword=''
  duplicatedNewPassword=''
  constructor(private authService: AuthService,
    private navCtrl: NavController,
    private toastController: ToastController,
    private route: ActivatedRoute) { 
   }

  ngOnInit() {
    // TODO ESTO SE PUEDE HACER EN EL GUARD DE LA RUTA CON EL CANACTIVATE
    if (!this.authService.getUserInfo()){
      this.navCtrl.navigateRoot("/home")
    }
    // check if exist recuperar true in getUserInfo 
    if (!this.authService.getUserInfo()['recuperacion']){
      this.navCtrl.navigateRoot("/home")
    }
  }
  reiniciar() {

    if (this.newPassword == ''){
      this.presentErrorToast("La nueva contraseña es obligatoria");
      return;
    }
    if (this.duplicatedNewPassword == ''){
      this.presentErrorToast("Debe repetir la nueva contraseña");
      return;
    }

    if(this.newPassword == this.duplicatedNewPassword){
      this.authService.resetPassword(this.authService.getUserInfo()['id'],
                                    this.authService.getUserInfo()['temp'],
                                    this.newPassword,this.duplicatedNewPassword).subscribe(res => {
        let user = {
          email: localStorage.getItem("email_user"), 
          password: this.newPassword
        }
        this.authService.login(user).pipe(
          catchError((error) => {
            if ([401, 403].includes(error.status)) {
              if (this.authService.isLoggedIn()){
                // auto logout if 401 or 403 response returned from api
                this.authService.logout();
                this.navCtrl.navigateRoot('/users/login');
              }
              this.presentErrorToast(error.error.msg)
            }
            const err = (error && error.error && error.error.message) || error.statusText;
            return throwError(() => err);
          })
        )
        .subscribe((res) => {  
            this.authService.setCurrentToken(res)
            localStorage.removeItem("email_user");
            this.presentToast('Se reestablecio correctamente la contraseña');
            this.navCtrl.navigateRoot("/home")
        })
      },
      error => {
        this.presentErrorToast(error.error.msg);
      });

    }else{
      this.presentErrorToast("Las contraseñas no coinciden");
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
