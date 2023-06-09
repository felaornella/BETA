import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-nueva-publicacion',
  templateUrl: './nueva-publicacion-menu.page.html',
  styleUrls: ['./nueva-publicacion-menu.page.scss'],
})
export class NuevaPublicacionMenuPage implements OnInit {

  constructor(private authService: AuthService,
    private alertController: AlertController,
    public navCtrl: NavController
  ) { }

  ngOnInit() {
  }

  back(){
    this.navCtrl.navigateRoot("/home")
  }

  publicacionPerdido(){
    if (this.authService.isLoggedIn()) {
      this.navCtrl.navigateRoot("/new-publicacion?tipoPublicacion=1")
    } else {
      const modalLogin = document.getElementById("modalLogin") as HTMLIonModalElement
      modalLogin.present()
    }
  }

  publicacionEncontrado(){
    this.navCtrl.navigateRoot("/new-publicacion?tipoPublicacion=2")
  }

  publicacionAdopcion(){
    if (this.authService.isLoggedIn()) {
      this.navCtrl.navigateRoot("/new-publicacion?tipoPublicacion=3")
    } else {
      const modalLogin = document.getElementById("modalLogin") as HTMLIonModalElement
      modalLogin.present()
    }
  }

  publicacionTransito(){
    if (this.authService.isLoggedIn()) {
      this.navCtrl.navigateRoot("/new-publicacion?tipoPublicacion=4")
    } else {
      const modalLogin = document.getElementById("modalLogin") as HTMLIonModalElement
      modalLogin.present()
    }
  }
  
  login(){
    const modalLogin = document.getElementById("modalLogin") as HTMLIonModalElement
    modalLogin.dismiss()
    this.navCtrl.navigateRoot("/users/login")
  }
}
