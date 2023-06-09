/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ViewChild } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';import { IonSlides, MenuController, NavController } from '@ionic/angular';
import { getIconMap } from 'ionicons/dist/types/components/icon/utils';
import * as L from 'leaflet';
import { Color, ListadoColoresDTO } from 'src/app/models/Color';
import { ListadoPublicacionesDTO, Publicacion } from 'src/app/models/Publicacion';
import { ListadoRazasDTO, Raza } from 'src/app/models/Raza';
import { GpsUtilsService } from 'src/app/services/gps-utils/gps-utils.service';
import { PublicacionesService } from 'src/app/services/publicaciones/publicaciones.service';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  @ViewChild('slides', {static: true}) slides: IonSlides;

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1.2,
    centeredSlides: true,
    centeredSlidesBounds: false,
    spaceBetween: 2.5 
  };

  publicaciones: Publicacion[];
  publicacionesOriginales: Publicacion[];
  markerActive : L.Marker;
  slideVisible= false;
  tocoSlide= false
  private map: L.Map;
  centroid: L.LatLngExpression = [-34.9204919, -57.9506799]; //
  userLocation: L.LatLngExpression = [-34.9204919, -57.9506799]; //
  markers: L.Marker[] = [];

  tipos = {}
  colores: Color[]=[];
  razas: Raza[]=[];
  razasOriginales: Raza[]=[];
  tipos_publicacion_ids = {
    1 : "perdidos",
    2 : "encontrados",
    3 : "adopcion",
    4 : "transito"
  }
  edad_estimada= {
    "Menos de 1 año" : '1' ,
    "1 a 3 años" : '2' ,
    "7 a 9 años" : '3' ,
    "Más de 10 años" : '4'
  }
  filtro = {
    "tipo_publicacion" : {'perdidos':true, 'encontrados':true, 'adopcion':true, 'transito':true},
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
  private initMap(): void {
    this.map = L.map('map', {
      center: this.centroid,
      zoom: 13
    });

    // const google = L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}',{
    //   maxZoom: 20,
    //   subdomains:['mt0','mt1','mt2','mt3']
    // });
    // const google2 = L.tileLayer('http://mt1.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}&s=Ga',{
    //   maxZoom: 20,
    // });

    // const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // });

    // const watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
    //     subdomains: 'abcd',
    //     minZoom: 1,
    //     maxZoom: 16,
    //     ext: 'jpg'
    // });

    // const baseMaps = {
    //   Google : google,
    //   Google2 : google2,
    //   OpenStreetMap : openStreetMap,
    //   Watercolor : watercolor,
    //   Esri : esri
    // };

    const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      noWrap: true
    });

   
    
    //L.control.layers(baseMaps).addTo(this.map);

    
    this.map.on('click', (e) => {this.desavilitarSlide();    });
    this.map.on('move', (e) => {this.centroid = [e.target.getCenter().lat,e.target.getCenter().lng];});

    esri.addTo(this.map);
    const mapDiv = document.getElementById('map');
    const resizeObserver = new ResizeObserver(() => {
      this.map.invalidateSize();
    });

    resizeObserver.observe(mapDiv);

  }

  constructor(public navCtrl: NavController, 
    private gpsUtilsService: GpsUtilsService,
      private publicacionesService: PublicacionesService, 
      public menuCtrl: MenuController,
      private utilsService: UtilsService) { }

  ngOnInit(): void {
    this.obtenerTipos()
    this.obtenerRazas()
    this.cargarColores()
    this.initMap();
    this.getGeoPosition();
    this.slides.lockSwipes(true);
  }

  getIconMap(typePet,typePublication){
    let type= '';
    // case of typePet as integer with 1 = dog and 2 = cat 3 = other
    if (typePet === 1) {
      type = 'dog';
    }else if (typePet === 2) {
      type = 'cat';
    }else {
      type = 'others';
    }

    const BetaIcon = L.Icon.extend({
      options: {
          customId: '',
          iconSize:     [40, 40],
          iconAnchor:   [20, 20]
      }
    });
    return new BetaIcon({iconUrl: 'assets/markers/'+type+'_'+typePublication+'.png'});
  }





  detallePublicacion(tipo,id){
    this.tocoSlide= true;
    //console.log("DETALLE PUBLICACION" + this.slideVisible)
    if (this.slideVisible){
      this.navCtrl.navigateForward('/publicacion-detalle/'+tipo+'/'+id);
    }else {
      this.avilitarSlide()
    }
  }

  

  getGeoPosition(){
    const setUserPosition= (position) => {
      //console.log(position)
      this.centroid = position;
      this.userLocation = position;
      this.map.panTo(position);
      this.map.setZoom(14);
      this.map.flyTo(position, 14);
      this.buscarAqui();
      //Set marker of user position
      L.HtmlIcon = L.Icon.extend({
        options: {
          /*
          html: (String) (required)
          iconAnchor: (Point)
          popupAnchor: (Point)
          */
        },
      
        initialize: function (options) {
          L.Util.setOptions(this, options);
        },
      
        createIcon: function () {
          var div = document.createElement('div');
          div.innerHTML = this.options.html;
          return div;
        },
      
        createShadow: function () {
          return null;
        }
      });
      const HTMLIcon = L.HtmlIcon.extend({
        options : {
            html : "<div class=\"map__marker\"></div>",
        }
    });
      const marker = L.marker(position, { icon: new HTMLIcon()}).addTo(this.map); // TODO CAMBIAR POR ICONO MAS LINDO
      //marker.bindPopup("Tu ubicación").openPopup();
    }
    this.gpsUtilsService.getGeoPosition(setUserPosition, ()=>{}, false)
  }

  cargarPublicaciones(lat, long){
    this.publicacionesService.obtenerPublicacionesMapa(lat,long).subscribe(
      (data) => {
        this.publicacionesOriginales = (data as ListadoPublicacionesDTO).publicaciones;
        // set a incremental id to each publication and turn on visible
        this.publicacionesOriginales.map((x,i) => { x.visible = true;});

        this.agregarPublicacionesAMapa();
      }
    );
  }

  buscarAqui(){
    this.cargarPublicaciones(this.centroid[0],this.centroid[1]);
  }

  agregarPublicacionesAMapa(){
    // comparar markadores en el mapa con los de la lista de publicaciones y eliminar los que no esten
    this.markers.map(
      x => this.map.removeLayer(x));

     this.publicaciones= this.publicacionesOriginales.filter( x => this.aplicaSegunFiltro(x))
     this.markers = this.publicaciones.map(
      x  => L.marker([x.geo_lat,x.geo_long], {icon: this.getIconMap(x.tipo_mascota_id,x.tipo) , customId: x.id , riseOnHover: true })
    ).map(
      x => {x.addTo(this.map).on('click', (e) => {
        this.markerActive = x;
        let publicacion = this.publicaciones.find(p => {
          //console.log("customId " + e.target.options.customId);
          //console.log(x.id === e.target.options.customId);
          return p.id === x.options.customId});
        if (!this.tocoSlide){
          this.map.flyTo([publicacion.geo_lat - 0.0005 , publicacion.geo_long], (this.map.getZoom() < 16) ? 16 : this.map.getZoom());
          this.tocoSlide = false;
        }
        this.avilitarSlide()
        this.slides.slideTo(this.publicaciones.findIndex(f => {return f.id === publicacion.id}))
        //console.log("CLICK MARKER to " + this.publicaciones.findIndex(f => {return f.id === publicacion.id}))
       
      })
      return x;
    }
    );


  }

  
  async ionSlideTouchEnd(e){
    this.slides.getActiveIndex().then(index => {
      let realIndex = index;
      if (e.target.swiper.isEnd) {  // Added this code because getActiveIndex returns wrong index for last slide
        realIndex = this.publicaciones.length - 1;  // length of the ngFor you are using for the slides
      }
      
      
      if (this.markerActive != null && this.markerActive != this.markers[realIndex] ){
        this.markerActive.setZIndexOffset(0);
        this.markers[realIndex].setZIndexOffset(1000);
        this.markerActive = this.markers[realIndex];
      }
      
      if (this.tocoSlide){
        this.markers[realIndex].fire('click');
        this.tocoSlide = false;
      }
      //console.log("FLYING TO ")
      this.map.flyTo([this.publicaciones[realIndex].geo_lat - 0.0005 , this.publicaciones[realIndex].geo_long], (this.map.getZoom() < 16) ? 16 : this.map.getZoom());
      
    });
    
  }
  
  avilitarSlide(){
    this.slideVisible = true;
    this.slides.lockSwipes(false);
  }

  desavilitarSlide(){
    this.slideVisible = false;
    this.slides.lockSwipes(true);
    this.tocoSlide = false;
  }


  /// FILTROS

  toggleMenu(){
    this.menuCtrl.toggle()
  }

  applyFilters(){
    this.agregarPublicacionesAMapa();
    this.menuCtrl.toggle()
  }

  aplicaSegunFiltro(publicacion: Publicacion){
    //console.log(this.filtro)
    if (!this.filtro.tipo_publicacion[this.tipos_publicacion_ids[publicacion.tipo]]){
      return false;
    }
    // Checkear rango de distancia con filter.distancia y publicacion.distancia ( es un string )
    // si publicacion distancia no comienza "Menor a 1" 
    // Checkear que publicacion.distancia sea un string 

    if (typeof(publicacion.distancia) == "string"){
      if (publicacion.distancia.startsWith("Menos de 1") && (this.filtro.distancia.lower > 0 || this.filtro.distancia.upper < 1)){
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


  obtenerRazas(){
    this.utilsService.obtenerRazas().subscribe((data) => {
      this.razas = (data as ListadoRazasDTO).razas;
      this.razasOriginales = this.razas;
      //console.log(this.razas)

    });
  }

  cargarColores(){
    this.utilsService.obtenerColores().subscribe((data)=>{
      this.colores = (data as ListadoColoresDTO).colores;
      //console.log(this.colores)
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
}
