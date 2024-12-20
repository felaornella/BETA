import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { MenuController } from '@ionic/angular';
import { RangeCustomEvent } from '@ionic/angular';
import { RangeValue } from '@ionic/core';
import { PublicacionesService } from 'src/app/services/publicaciones/publicaciones.service';
import { ListadoPublicacionesDTO, Publicacion } from 'src/app/models/Publicacion';
import { ListadoRazasDTO, Raza } from 'src/app/models/Raza';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { Color, ListadoColoresDTO } from 'src/app/models/Color';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ActivatedRoute } from '@angular/router';
import { GpsUtilsService } from 'src/app/services/gps-utils/gps-utils.service';
import { ModalController } from '@ionic/angular';
import { MapModalComponent } from '../../components/map-modal/map-modal.component';

@Component({
  selector: 'app-home-per-enc',
  templateUrl: './home-per-enc.page.html',
  styleUrls: ['./home-per-enc.page.scss'],
})
export class HomePerEncPage implements OnInit {
  publicaciones: Publicacion[] ;
  colores: Color[]=[];
  razasOriginales : Raza[]=[];
  razas: Raza[]=[];
  local_tipo_mascota_id:"";
  centroid = [];
  tipos = {}
  edad_estimada= {
    "Menos de 1 año" : '1' ,
    "1 a 3 años" : '2' ,
    "7 a 9 años" : '3' ,
    "Más de 10 años" : '4'
  }
  filtro = {
    "tipo_publicacion" : {1:true,2:true},
    "distancia": { lower: 0, upper: 25 },
    "tipo" : { 
      1 : true,
      2 : true,
      3 : true
    },
    "sexo" : {
      "macho" : true,
      "hembra" : true
    },
    "raza" : [],
    "colores" : [],
    "size" : [],
    "edad" : [],
  };
  togglesActivados = false
  fallo: boolean = false;

  constructor(
    private gpsUtilsService: GpsUtilsService,
    private utilsService: UtilsService,
    private service: PublicacionesService,
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public route: ActivatedRoute,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.togglesActivados = false
    this.route.queryParams.subscribe(params => {
      if (params && params.reload) {
        //console.log("reload")
        this.obtenerPublicaciones()
      }
    });
    this.obtenerTipos()
    this.obtenerRazas()
    this.cargarColoresPrueba()
    this.getGeoPosition();
  }

  handleRefresh(event) {
    this.getGeoPosition()
  };

  toggleMenu(){
    this.menuCtrl.toggle()
  }

  togglePerdidos(){
    this.filtro.tipo_publicacion[1] = !this.filtro.tipo_publicacion[1]
    this.applyFilters();
  }

  toggleEncontrados(){
    this.filtro.tipo_publicacion[2] = !this.filtro.tipo_publicacion[2]
    this.applyFilters();
  }

  back(){
    this.navCtrl.navigateRoot("/home")
  }


  cargarColoresPrueba(){
    this.utilsService.obtenerColores().subscribe((data)=>{
      //console.log(data)
      this.colores = (data as ListadoColoresDTO).colores;
    });
  }


  detallePublicacion(tipo,id){
    this.navCtrl.navigateForward("/publicacion-detalle/"+tipo+"/"+id)
  }

  obtenerPublicaciones(){
    this.service.obtenerPerdidosEncontrados(this.centroid).subscribe((data) => {
      this.publicaciones = (data as ListadoPublicacionesDTO).publicaciones;
      this.publicaciones.forEach((e)=>{ e.visible=true; });
      this.togglesActivados = true
      this.applyFilters();

      const refresher = document.getElementById("refresher") as HTMLIonRefresherElement
      refresher.complete()
    } , (error) => {
      this.publicaciones = []
      this.fallo = true
      const refresher = document.getElementById("refresher") as HTMLIonRefresherElement
      refresher.complete()
      });

  }

  obtenerRazas(){
    this.utilsService.obtenerRazas().subscribe((data) => {
      this.razas = (data as ListadoRazasDTO).razas;
      this.razasOriginales = this.razas;
      //console.log(this.razas);
    });
  }

  obtenerTipos(){
    this.utilsService.obtenerTipos().subscribe((data) => {
      // recorrer data tipos y agregarlos a this.tipos con el id como key y nombre como value
      data["tipos"].forEach((e)=>{
        this.tipos[e.id] = e.nombre;
      });
      //console.log(this.tipos)
    });
  }

  cambioTipos(e){
    // filtrar razas por tipo activas
    this.razas = this.razasOriginales.filter((e)=>{ return this.filtro.tipo[e.tipo_mascota_id] });
  }



  getGeoPosition(){
    const getGeo= (position) => {
      this.centroid = position
      this.fallo = false
      //console.log("consiguio position")
      this.obtenerPublicaciones()
    }
    const onError = () => {
      this.centroid = this.mapaStarter ? this.mapaStarter : [-34.9206797, -57.9537638];
      this.fallo = false
      const refresher = document.getElementById("refresher") as HTMLIonRefresherElement
      refresher.complete()
      this.obtenerPublicaciones()
    };
    this.gpsUtilsService.getGeoPosition(getGeo, onError, true)
  }




  applyFilters(){
    if (!this.publicaciones){
      return;
    }
    this.publicaciones.forEach((e)=>{
      e.visible= this.aplicaSegunFiltro(e);
    });
    this.menuCtrl.close()

  }

  aplicaSegunFiltro(publicacion: Publicacion){
    //console.log(this.filtro)
    if (!this.filtro.tipo_publicacion[publicacion.tipo]){
      return false;
    }
    // Checkear rango de distancia con filter.distancia y publicacion.distancia ( es un string )
    // si publicacion distancia no comienza "Menor a 1" 
    // Checkear que publicacion.distancia sea un string 

    if (typeof(publicacion.distancia) == "string"){
      if (publicacion.distancia.startsWith("Menos de 1") && (this.filtro.distancia.lower > 0 || this.filtro.distancia.upper <= 1)){
        return false;
      }
    } 
    else {
      // si no comienza con "Menor a 1" entonces es un numero
      let dist = parseFloat(publicacion.distancia);

      if (dist > this.filtro.distancia.upper || dist < this.filtro.distancia.lower){
        return false;
      }
    }
      

    // recorrer tipos y si no aplica retornar false
    if (!this.filtro.tipo[publicacion.tipo_mascota_id]){
      return false;
    }
    // recorrer sexo y si no aplica retornar false
    if (!this.filtro.sexo[publicacion.sexo.toLowerCase()]){
      return false;
    }
    // recorrer raza y si no aplica retornar false
    if (this.filtro.raza.length > 0){
      if (!this.filtro.raza.includes(publicacion.raza_mascota_id.toString())){
          return false;
    }
  }
    // recorrer colores y si no aplica retornar false
    if (this.filtro.colores.length > 0){
      // recorrer colores de la publicacion
      let aplica = false;
      publicacion.colores.forEach((e)=>{
        if (this.filtro.colores.includes(e)){
          aplica = true;
        }
      }
      );
      if (!aplica){
        return false;
      }
    }
    // recorrer size y si no aplica retornar false
    if (this.filtro.size.length > 0){
      if (!this.filtro.size.includes(publicacion.size)){
        return false;
      }
    }
    // recorrer edad y si no aplica retornar false
    if (this.filtro.edad.length > 0){
      // Si edad de la publicacion es aproximada comparar edad_estimada sino calcular edad con edad y edad unidad
      if (publicacion.edad_aprox){
        if (!this.filtro.edad.includes(this.edad_estimada[publicacion.edad_estimada])){
          return false;
        }
      } else {
        // Si la edad unidad es meses solo es valido si el filtro es menor a 1 año
        if (publicacion.edad_unidad == "meses"){
          if (publicacion.edad < 12 && !this.filtro.edad.includes("1")){
            return false;
          }
          if (publicacion.edad >= 12){
            // Calcular edad en años
            let edad = publicacion.edad / 12;
            if (!this.edadValida(edad)){
              return false;
            }
          }
        }
        // Si la edad unidad es años solo es valido si el filtro es mayor a 1 año
        if (publicacion.edad_unidad == "años"){
          if (!this.edadValida(publicacion.edad)){
            return false;
          }
        }
      }

    }
    // si llega hasta aca es porque aplica
    return true;
  }
  
  edadValida(edad){
    if (edad >= 1 &&  edad <= 3 && !this.filtro.edad.includes("2")){
      return false;
    }
    if (edad >= 4 &&  edad <= 6 && !this.filtro.edad.includes("3")){
      return false;
    }
    if (edad >= 7 &&  edad <= 9 && !this.filtro.edad.includes("4")){
      return false;
    }
    if (edad > 9 &&  !this.filtro.edad.includes("5")){
      return false;
    }
  }

  mapaStarter: number[]
  async openLocationMap() {
    
    const modal = await this.modalCtrl.create({
      component: MapModalComponent,
      componentProps: {
        editable: true,
        marker: this.mapaStarter,
        typePublication: '1',
        typePet: 0,
     }
    });
    modal.present();
    const { data , role } = await modal.onWillDismiss();
    console.log(data);
    console.log(role);
    if (role === 'confirm') {
      
      this.centroid = [data["lat"],data["lng"]];
      this.mapaStarter = [data["lat"],data["lng"]];
      this.obtenerPublicaciones();
      // Update data
    }
  }


}
