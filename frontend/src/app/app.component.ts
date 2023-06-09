import { Component, NgZone, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { NavController, Platform } from '@ionic/angular';
import { ProfilePage } from './pages/profile/profile.page';
import { PublicacionDetallePage } from './pages/publicacion-detalle/publicacion-detalle.page';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private deeplinks: Deeplinks,
    private router: Router,
    private zone: NgZone,
    private navCtrl: NavController
  ) {
    this.initializeApp()
  }


  initializeApp(){
    this.platform.ready().then( () => {
      this.setupDeepLinks()
    })
  }

  setupDeepLinks(){
    this.deeplinks.route({
      "/publicacion-detalle/:tipoPublicacion/:publicationId": PublicacionDetallePage,
      "/perfil/:userId": ProfilePage,
    }).subscribe( match => {
      //console.log("Hubo match: ", match)
      // const internalPath = `/${match.$route}/${match.$args["tipoPublicacion"]}/${match.$args["publicationId"]}`
      this.zone.run(() => {
        //console.log(match.$link["path"])
        this.router.navigateByUrl(`${match.$link["path"]}`)
      })
    })
  }
}
