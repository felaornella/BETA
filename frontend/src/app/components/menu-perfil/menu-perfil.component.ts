import { Component, Input, OnInit } from '@angular/core';
import { NavController, Platform, ToastController } from '@ionic/angular';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ClipboardService } from 'ngx-clipboard';

@Component({
  selector: 'app-menu-perfil',
  templateUrl: './menu-perfil.component.html',
  styleUrls: ['./menu-perfil.component.scss'],
})
export class MenuPerfilComponent implements OnInit {
  @Input()
  perfilLogeado = false;
  @Input() public userId;
  @Input() public onClick = () => {}
  constructor(private authService: AuthService,
    public navCtrl: NavController,
      private toastController: ToastController,
      private platform: Platform,
      private clipboard: ClipboardService,
      private socialSharing: SocialSharing) { }

  ngOnInit() {}

  editUser(){
    this.onClick();
    this.navCtrl.navigateRoot('/miperfil/editar');
  }

  changePassword(){
    this.onClick();
    this.navCtrl.navigateForward('/miperfil/cambiarpassword');
  } 

  cerrarSesion(){
    this.onClick();
    this.authService.logout();
    this.navCtrl.navigateRoot('/home');
  }

  misMascotas(){
    this.onClick();
    this.navCtrl.navigateRoot("/mis-mascotas")
  }

  shareProfile(){
    let message = ""
    if (this.perfilLogeado){
      message = "Hola, te comparto mi perfil de BETA";
    }else {
      message = "Hola, te comparto el siguiente perfil de BETA";
    }
    const subject = "Perfil de BETA";
    const url = environment.baseFrontUrl+"/perfil/"+this.userId;
    //console.log("Share: " + message + " " + url );
    if(this.platform.is('cordova')) {
      this.socialSharing.share(message, subject, undefined, url);
    }else {
      this.clipboard.copyFromContent(message + " " + url); 
      this.presentToast();
    }
    this.onClick();
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Se copio el perfil al portapapeles',
      duration: 3000,
      position: 'bottom',
      color: 'beta'
    });

    await toast.present();
  }

  
}
