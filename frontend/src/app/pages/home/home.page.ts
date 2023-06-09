import { Component } from '@angular/core';
import { AlertController, MenuController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  texts=[]
  isLoggedIn = this.authService.isLoggedIn
  
  
  constructor(
    private alertController: AlertController,
    private authService: AuthService,
    public menuCtrl: MenuController,
    public navCtrl: NavController
  ) {}

  ngOnInit(){
  }

  toogleMenu(){
    this.menuCtrl.toggle()  
  }

  homePerdidosEncontrados(){
    this.navCtrl.navigateRoot("/home/perdidos-y-encontrados")
  }

  homeAdopcionTransito(){
    this.navCtrl.navigateRoot("/home/adopcion-y-transito")
  }

  agrupaciones(){
    this.navCtrl.navigateRoot("/agrupaciones")
  }

  miPerfil(){
    if (this.authService.isLoggedIn()) {
      this.navCtrl.navigateRoot("/perfil/miperfil")
    } else {
      const modalLogin = document.getElementById("modalLogin") as HTMLIonModalElement
      modalLogin.present()
    }
    
  }

  newPost(){
    this.navCtrl.navigateRoot("/nueva-publicacion-menu")
  }

  misMascotas(){
    if (this.authService.isLoggedIn()) {
      this.navCtrl.navigateRoot("/mis-mascotas")
    } else {
      const modalLogin = document.getElementById("modalLogin") as HTMLIonModalElement
      modalLogin.present()
    }
  }

  buscar(){
    this.navCtrl.navigateRoot("/buscar")
  }

  logout(){
    this.authService.logout()
    this.navCtrl.navigateRoot("/users/login")
  }
  login(){
    const modalLogin = document.getElementById("modalLogin") as HTMLIonModalElement
    modalLogin.dismiss()
    this.navCtrl.navigateRoot("/users/login")
  }
  openMap(){
    this.navCtrl.navigateForward("/map")
  }
}
