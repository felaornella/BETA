import { Component, Input, OnInit } from '@angular/core';
import { NavController, ToastController, Platform } from '@ionic/angular';
import { ClipboardService } from 'ngx-clipboard';
import { AuthService } from 'src/app/services/auth/auth.service';
import { environment } from 'src/environments/environment';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@Component({
  selector: 'app-menu-mascota',
  templateUrl: './menu-mascota.component.html',
  styleUrls: ['./menu-mascota.component.scss'],
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

  shareMascota(){
    let message = ""
    message = "Hola, te comparto mi mascota ";
    const subject = "Mascota en BETA";    
    const url = environment.baseApiUrl+"/mascota/perfil/"+this.mascotaId;

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
      message: 'Se copio la mascota al portapapeles',
      duration: 3000,
      position: 'bottom',
      color: 'beta'
    });

    await toast.present();
  }

}
