import { Component, Input, OnInit } from '@angular/core';
import { NavController, ToastController, Platform, IonicModule } from '@ionic/angular';
import { ClipboardService } from 'ngx-clipboard';
import { AuthService } from 'src/app/services/auth/auth.service';
import { environment } from 'src/environments/environment';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-mascota',
  templateUrl: './menu-mascota.component.html',
  styleUrls: ['./menu-mascota.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class MenuMascotaComponent implements OnInit {
  @Input()
  perfilLogeado = false;
  @Input() public mascotaId;
  @Input() public onClick = () => {}
  @Input() public delete = () => {}

  constructor(private authService: AuthService,
    public navCtrl: NavController,
      private toastController: ToastController,
      private platform: Platform,
      private clipboard: ClipboardService,
      private socialSharing: SocialSharing) { }

  ngOnInit() {}

  editMascota(){
    this.onClick();
    this.navCtrl.navigateRoot("/edit-mascota/" + this.mascotaId)
  }

  deleteMascota(){
    this.onClick();
    this.delete();
  }

  async shareMascota() {
    let message = "🐾🐶 Te comparto mi mascota 🐾🐶";
    const subject = "Mascota de BETA 🐾";
    const url = environment.baseFrontUrl + "/mascota/perfil/" + this.mascotaId;

    if (this.platform.is('cordova')) {
      this.socialSharing.share(message, subject, undefined, url);
    } else {
      try {
        await navigator.clipboard.writeText(message + "\n" + url);
        this.presentToast('Se copió el mensaje al portapapeles 📋');
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = message + " " + url;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          this.presentToast('Se copió el mensaje al portapapeles');
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
