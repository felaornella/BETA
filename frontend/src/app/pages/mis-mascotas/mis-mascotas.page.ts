import { Component, OnInit } from '@angular/core';
import { NavController, Platform, ToastController } from '@ionic/angular';
import { ListadoMascotas } from '../../models/Pet';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { getUrlImg } from '../../../app/utils/utils';
import { MascotasService } from '../../services/mascotas/mascotas.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { AuthService } from 'src/app/services/auth/auth.service';

// https://enappd.com/blog/ionic-complete-guide-barcode-qrcode-scan/140/ QR CODE DOCs

@Component({
  selector: 'app-mis-mascotas',
  templateUrl: './mis-mascotas.page.html',
  styleUrls: ['./mis-mascotas.page.scss'],
})
export class MisMascotasPage implements OnInit {
  mascotas:any[] = []
  scannedData: any;
  hide_spinner = false
  getUrlImg = getUrlImg

  constructor(
    public navCtrl: NavController,
    private service: UsuariosService,
    private barcodeScanner: BarcodeScanner,
    private toastController: ToastController,
    private mascotasService: MascotasService,
    private utils: UtilsService,
    private authService: AuthService,
    private platform: Platform,
  ) { }

  ngOnInit() {
    if (this.authService.isLoggedOut()){
      this.navCtrl.navigateRoot("/home")
    }
  }
  
  ionViewDidEnter(){
    this.prepareOwnPetSide()
  }
  handleRefresh(event) {
    this.prepareOwnPetSide()
  };
  prepareOwnPetSide(){
    this.service.misMascotas().subscribe((data)=>{
      this.hide_spinner = true
      this.mascotas = data as Array<any>
      
      const refresher = document.getElementById("refresher") as HTMLIonRefresherElement
      refresher.complete()
    })
  }

  back(){
    // this.navCtrl.navigateRoot("/home")
    // this.navCtrl.back()
    let lv = this.utils.getUltimasURL()
    for (let i=lv.length - 1; i>=0; i--){
      if( lv[i] == "/perfil/miperfil" ||
          lv[i] == `/perfil/${this.authService.getUserInfo()["id"]}` ||
          lv[i] == "/home" ){
          this.navCtrl.navigateBack(lv[i])
          return false  
      }
    }
    this.navCtrl.navigateBack("/home")
  }

  seleccionarMascota(id){
    this.navCtrl.navigateForward("/mi-mascota-detalle/"+id)
  }

  addMascota(){
    const modal = document.getElementById("modalNewPet") as HTMLIonModalElement
    modal.dismiss()
    
    this.navCtrl.navigateRoot("/new-mascota")
  }

  leerQRMascota(){
    // alert("Mostra el QR")
    if(this.platform.is('cordova')) {
      const modal = document.getElementById("modalNewPet") as HTMLIonModalElement
      modal.dismiss()
      const options: BarcodeScannerOptions = {
        preferFrontCamera: false,
        showFlipCameraButton: false,
        showTorchButton: false,
        torchOn: false,
        prompt: '',
        resultDisplayDuration: 0,
        formats: 'QR_CODE',
        orientation: 'portrait',
      };

      this.barcodeScanner.scan(options).then(barcodeData => {
        this.presentToast('Codigo QR Escaneado exitosamente');
        this.scannedData = barcodeData.text;

        
        this.hide_spinner = false

        this.mascotasService.agregarPorQR(this.scannedData).pipe(
          catchError((error) => {
            const err = (error && error.error && error.error.message) || error.statusText;
            this.hide_spinner = true
            this.presentErrorToast((error.error.msg) ? error.error.msg : "Algo salio mal")
            return throwError(() => err);
          })
        )
        .subscribe(
          (res) => {
            this.hide_spinner = true
            this.mascotas = []
            this.mascotas = this.mascotas.concat(res)
            this.presentToast("Mascota añadida con exito!")
          }
        )

      }).catch(err => {
        console.log('Error', err);
      });
    }else {
      this.presentToast("Esta funcionalidad solo está disponible en la aplicación", "asociation", "alert-circle-outline")
    }
  }

  async presentToast(message, color = 'beta', icon = 'checkmark-circle-outline') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
      icon: icon
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
