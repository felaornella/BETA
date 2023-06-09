import { Component, OnInit } from '@angular/core';
import { IonBackButton, NavController, Platform } from '@ionic/angular';
import { getUrlImg } from 'src/app/utils/utils';
import { ListadoOrganizaciones } from '../../models/Usuario';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GpsUtilsService } from 'src/app/services/gps-utils/gps-utils.service';

@Component({
  selector: 'app-agrupaciones',
  templateUrl: './agrupaciones.page.html',
  styleUrls: ['./agrupaciones.page.scss'],
})
export class AgrupacionesPage implements OnInit {
  organizaciones: any[];
  getUrlImg = getUrlImg;
  centroid= [];
  falloUbicacion: boolean = false;

  constructor(
    private gpsUtilsService: GpsUtilsService,
    private geolocation: Geolocation,
    public navCtrl: NavController,
    private service: UsuariosService
  ) {
  
  }

  ngOnInit() {
    this.getGeoPosition();
  }
  handleRefresh(event) {
    this.getGeoPosition()
  };

  getGeoPosition(){
    const getGeo= (position) => {
      this.centroid = position
      this.falloUbicacion = false 
      this.obtenerOrganizaciones()
    }
    const onError = () => {
      this.organizaciones = []
      this.falloUbicacion = true
      const refresher = document.getElementById("refresher") as HTMLIonRefresherElement
      refresher.complete()
    };    
    this.gpsUtilsService.getGeoPosition(getGeo, onError, true)
  }

  obtenerOrganizaciones(){
    this.service.obtenerOrganizaciones(this.centroid).subscribe((data)=>{
      this.organizaciones = (data as ListadoOrganizaciones).organizaciones
      //console.log(this.organizaciones)
      const refresher = document.getElementById("refresher") as HTMLIonRefresherElement
      refresher.complete()
    })
  }

  perfilAgrupacion(id){
    // this.navCtrl.navigateRoot("/")
    this.navCtrl.navigateForward('/perfil/'+id);
  }

}
