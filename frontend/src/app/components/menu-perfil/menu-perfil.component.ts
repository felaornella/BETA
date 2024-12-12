import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, NavController, Platform, ToastController } from '@ionic/angular';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ClipboardService } from 'ngx-clipboard';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-perfil',
  templateUrl: './menu-perfil.component.html',
  styleUrls: ['./menu-perfil.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
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

  async shareProfile() {
    let message = "Hola, te comparto mi perfil de BETA";
    if (!this.perfilLogeado) {
      message = "Hola, te comparto el siguiente perfil de BETA";
    }
    const subject = "Perfil de BETA";
    const url = environment.baseFrontUrl + "/perfil/" + this.userId;

    if (this.platform.is('cordova')) {
      this.socialSharing.share(message, subject, undefined, url);
    } else {
      try {
        await navigator.clipboard.writeText(message + "\n" + url);
        this.presentToast('Se copió el perfil al portapapeles 📋');
      } catch (err) {
        // Fallback para navegadores más antiguos
        const textArea = document.createElement("textarea");
        textArea.value = message + " " + url;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          this.presentToast('Se copió el perfil al portapapeles📋');
        } catch (err) {
          this.presentToast('No se pudo copiar al portapapeles');
        }
        document.body.removeChild(textArea);
      }
    }
    this.onClick();
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

  
}
