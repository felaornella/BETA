import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { NavController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  constructor(private navCtrl: NavController,
    private toastCtrl: ToastController,
    private authService: AuthService) { }

  private URL_API= environment.baseApiUrl
  //I've used header 'X-JWT-Token: On' for requests requiring token in the API requests requiring JWT token. 
  //In my interceptor I check presence of that header, if it exists it removes it and add bearer header.
  intercept(req, next) {


    const idToken =  this.authService.getCurrentToken();
    const isApiUrl = req.url.startsWith(this.URL_API);
    // const isApiUrl = true

    if (idToken && isApiUrl) {
      req = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + idToken)
      });
    }
    // Check if the response code is 422 and loggout
    return next.handle(req).pipe(
      tap(
        event => {
          // console.log(event)
        },
        error => {
          if (error instanceof HttpErrorResponse) {
            if (error.status === 422) {
              //console.log('422 error')
              this.authService.logout()
              this.navCtrl.navigateRoot('/home');
              this.toastCtrl.create({
                message: 'Sesión expirada',
                duration: 2000,
                color: 'danger'
              }).then(toast => toast.present());
              
            }
          }
        }
      )
    );
    
  }

}
