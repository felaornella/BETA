import { Injectable } from '@angular/core';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { AlertController, NavController, Platform, ToastController } from '@ionic/angular';
import { AuthService } from '../auth/auth.service';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

@Injectable({
  providedIn: 'root',
})
export class GpsUtilsService {

  constructor(private diagnostic : Diagnostic,
    private toastController : ToastController,
    private alertController: AlertController,
    private navCtrl: NavController,
    private platform: Platform,
    private locationAccuracy : LocationAccuracy,
    private authService: AuthService) { }

  private options = {
    timeout: 2000, 
    enableHighAccuracy: true, 
    maximumAge: 3600
  };
  public locationAccuracyRequested = 0;

  public getGeoPosition(onSuccess, onError, required, backToHome = true) {
    const onSuccessPosition = (position) => {
        position = [position.coords.latitude, position.coords.longitude];
        onSuccess(position);
    };

    const onErrorPosition = (error) => {
        if (error.code == GeolocationPositionError.PERMISSION_DENIED) {
            onError();
            return;
        }
        if (error.code == GeolocationPositionError.POSITION_UNAVAILABLE || error.code == GeolocationPositionError.TIMEOUT) {
            if (this.platform.is('cordova') && this.locationAccuracy) {
                this.locationAccuracy.canRequest().then((canRequest: boolean) => {
                    if (canRequest) {
                        this.locationAccuracyRequested++;
                        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
                            () => {
                                this.getGeoPosition(onSuccess, onError, required, backToHome);
                            },
                            error => {
                                onError();
                            }
                        );
                    } else {
                        onError();
                    }
                });
            } else {
                onError();
            }
        }
    };
    navigator.geolocation.getCurrentPosition(onSuccessPosition, onErrorPosition, this.options);
  }

  async presentAlert(onSuccess,onError,backToHome = false) {
    const alert = await this.alertController.create({
      header: 'Es necesario activar el GPS',
      message: 'Para poder usar esta funcionalidad, debes activar el GPS en los ajustes de tu dispositivo.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            if (backToHome) {
              this.navCtrl.navigateRoot('/home');
            }
            return false;
          },
        },
        {
          text: 'Cambiar ajustes',
          role: 'confirm',
          handler: () => {
            this.diagnostic.switchToSettings().then(() => {
              //console.log('Successfully switched to Settings');
              this.getGeoPosition(onSuccess, onError, true, backToHome);
            }, error => {
              this.presentErrorToast()
              if (backToHome) {
                this.navCtrl.navigateRoot('/home');
              }
              return false;

            }
            );
          },
        },
      ],
    
    });

    await alert.present();
  }

  async presentErrorToast() {
    const toast = await this.toastController.create({
      message: 'No se ha actualizado los permisos de ubicacion.',
      duration: 5000,
      position: 'bottom',
      cssClass: 'custom-toast',
      color: 'danger'
    });

    await toast.present();
  }
}