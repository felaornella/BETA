import { NgModule,LOCALE_ID  } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptorService } from './services/auth/token-interceptor.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { ClipboardModule } from 'ngx-clipboard';

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { CommonModule, registerLocaleData } from '@angular/common';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import localeAr from '@angular/common/locales/es-AR';
registerLocaleData(localeAr);

@NgModule({
  declarations: [AppComponent],
  imports: [CommonModule, BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, ClipboardModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy},SocialSharing,Clipboard,Geolocation,LocationAccuracy,Diagnostic,
    BarcodeScanner, Camera, File, Deeplinks,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
  },
  { provide: LOCALE_ID, useValue: 'es-AR'}],
  bootstrap: [AppComponent],
})
export class AppModule {}
