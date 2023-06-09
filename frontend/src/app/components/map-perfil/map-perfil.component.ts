import { Component, Input, OnInit } from '@angular/core';
import { NavController, ModalController, NavParams, ActionSheetController } from '@ionic/angular';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-perfil',
  templateUrl: './map-perfil.component.html',
  styleUrls: ['./map-perfil.component.scss'],
})
export class MapPerfilComponent implements OnInit {
  @Input()
  markerPos: number[] = [-34.92084652172, -57.954447724]; 
  @Input()
  editable = false;
  actualMarker: any;


  private map: L.Map;


  constructor(public navCtrl: NavController) { }

  private initMap(): void {
    this.map = L.map('mapPerfil', {
      center: this.markerPos,
      zoom: 11,
      zoomControl: false,
      attributionControl: false 
    });

    const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {});


    esri.addTo(this.map);

    
    this.actualMarker = L.marker(this.markerPos);
    this.actualMarker.addTo(this.map);
  
    // Block moving the map
    this.map.dragging.disable();
    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.scrollWheelZoom.disable();

    const mapDiv = document.getElementById('mapPerfil');
    const resizeObserver = new ResizeObserver(() => {
      this.map.invalidateSize();
    });

    resizeObserver.observe(mapDiv);

  }



  ngOnInit(): void {
    //console.log(this.markerPos);
    this.initMap();
  }

}
