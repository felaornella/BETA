import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-mascota-perfil-redirect',
  templateUrl: './mascota-perfil-redirect.page.html',
  styleUrls: ['./mascota-perfil-redirect.page.scss'],
})
export class MascotaPerfilRedirectPage implements OnInit {
  direc: string
  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController
  ) {
    route.params.subscribe((params)=>{
      //console.log(params)
      this.direc = `${environment.baseApiUrl}/mascota/perfil/${params["idMascota"]}`
      window.open(`${environment.baseApiUrl}/mascota/perfil/${params["idMascota"]}`, '_blank');
      // this.navCtrl.navigateRoot("/home")
    })
  }

  ngOnInit() {
  }

}
