import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { Usuario } from 'src/app/models/Usuario';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { catchError, switchMap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { MapModalComponent } from 'src/app/components/map-modal/map-modal.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {
  ubicacion: number[]= [];


  showing: number = 1
  local_es_organizacion: string = "false";
  user:Usuario = new Usuario();
  password:string = '';
  email = "";

  hide_spinner = true;
  constructor(private modalCtrl: ModalController,
    public navCtrl: NavController,
    private toastController: ToastController,
    private authService : AuthService,
    private loadingCtrl: LoadingController) { 
    this.user.es_organizacion = false;
   }
  ngOnInit() {
  }

  switchType(tab){
    this.showing = tab
  }

  setValue(){
    this.user.es_organizacion = this.local_es_organizacion == "true"
  }

  async register(){
    const loading = await this.loadingCtrl.create({
      message: 'Procesando',
      duration: 15000,
      spinner:  "dots",
      translucent: true,
      cssClass: 'custom-loading'
    });
    loading.present();
    this.authService.register(this.user,this.password).subscribe(res => {
      setTimeout( ()=> {
        loading.dismiss();
        this.authService.setCurrentToken(res)
        this.authService.setUserInfo(res)
        this.presentToast("¡Bienvenido/a " + res["user_info"]["nombre"] + "!")
        this.navCtrl.navigateRoot("/home")
      }, 1000)
    },
    error => {
      setTimeout( ()=> {
        loading.dismiss();
        this.presentErrorToast(error.error.msg)
      }, 1000)
    });

  }

  async login(){
    if (this.email == ""){
      this.presentErrorToast("El email es obligatorio");
      return;
    }
    if (this.password == ""){
      this.presentErrorToast("La contraseña es obligatoria");
      return;
    }
    const loading = await this.loadingCtrl.create({
      message: 'Procesando',
      duration: 15000,
      spinner:  "dots",
      translucent: true,
      cssClass: 'custom-loading'
    });
    loading.present();
    this.authService.login({email: this.email, password: this.password})
    // this.authService.login({email: "felipeornella@hotmail.com", password: "Pindonga"})
      .pipe(
        catchError((error) => {
          if ([401, 403].includes(error.status)) {
            if (this.authService.isLoggedIn()){
              // auto logout if 401 or 403 response returned from api
              this.authService.logout();
            }
            this.presentErrorToast(error.error.msg)
          }
          loading.dismiss();
          const err = (error && error.error && error.error.message) || error.statusText;
          return throwError(() => err);
        })
      )
      .subscribe((res) => {  
          // Check if in user info exists "Recuperar": true
          setTimeout( ()=> {
            loading.dismiss();

            if (res["user_info"] && res["user_info"]["recuperacion"] == true) {
              res["user_info"]["temp"]=this.password;
              this.authService.setUserInfo(res)

              this.navCtrl.navigateRoot("/recuperar-password")
              return;
            }
              this.authService.setCurrentToken(res)
              this.authService.setUserInfo(res)
              this.presentToast("¡Bienvenido/a " + res["user_info"]["nombre"] + "!")
              this.navCtrl.navigateRoot("/home")
          }, 1000)
      })
  }

  recuperar(){
    if (this.email == ''){
      this.presentErrorToast('Por favor, ingrese un correo electrónico')
      return
    }
    this.hide_spinner = false
    this.authService.forgotMyPassword(this.email).subscribe(res => {
      this.hide_spinner = true
      this.showing = 1
      this.presentToast(res["msg"])
    },
    error => {
      this.presentErrorToast(error.error.msg)
    });
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
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



  // MAPA
   
  async openMap() {
    const modal = await this.modalCtrl.create({
      component: MapModalComponent,
      componentProps: {
        editable: true,
        paramMarker : this.user.geo_lat != null ? [this.user.geo_lat, this.user.geo_long] : [],
        isUser: true
     }
    });
    modal.present();

    const { data , role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.user.geo_lat = data["lat"];
      this.user.geo_long = data["lng"];

    }

  }
}
