import { Component, Input, OnInit } from '@angular/core';
import { ActionSheetController, ModalController, NavController, NavParams } from '@ionic/angular';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit {
  @Input()
  typePublication: string;
  @Input()
  typePet: number;
  @Input()
  paramMarker: []; //
  @Input()
  actualMarker: any;
  @Input()
  editable = false;
  confirmText='';
  @Input()
  isUser = false;

  private map: L.Map;


  constructor(public navCtrl: NavController,
    private modalCtrl: ModalController,
    public navParams: NavParams,
    private actionSheetCtrl: ActionSheetController) { }

  private initMap(): void {
    this.map = L.map('map2', {
      center: (this.paramMarker != null && this.paramMarker.length > 0 ) ? this.paramMarker : [-34.92084652172, -57.954447724] ,
      zoom: 14
    });


  //   const google = L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}',{
  //     maxZoom: 20,
  //     subdomains:['mt0','mt1','mt2','mt3']
  //   });

  //   const google2 = L.tileLayer('http://mt1.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}&s=Ga',{
  //     maxZoom: 20,
  //   });

  //   const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  // });
    const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
  });

  
    // const baseMaps = {
    //   Google : google,
    //   Google2 : google2,
    //   OpenStreetMap : openStreetMap,
    //   Esri : esri
    // };

    // L.control.layers(baseMaps).addTo(this.map);

    if ( this.paramMarker != null && this.paramMarker.length > 0 ) {
      this.actualMarker = L.marker(this.paramMarker, {icon: this.getIconMap(this.typePet,this.typePublication), draggable : this.editable });
      this.actualMarker.addTo(this.map);
    }


    esri.addTo(this.map);

    if (this.editable) {
      this.map.on('click', (e) => {
        if(this.actualMarker != null){
          this.map.removeLayer(this.actualMarker);
        }
        this.actualMarker = L.marker(e.latlng as L.LatLngExpression, {icon: this.getIconMap(this.typePet,this.typePublication) , draggable: true });
        this.actualMarker.addTo(this.map);
      });
    }


    const mapDiv = document.getElementById('map2');
    const resizeObserver = new ResizeObserver(() => {
      this.map.invalidateSize();
    });

    resizeObserver.observe(mapDiv);

  }



  ngOnInit(): void {
    if (this.editable) {
      this.confirmText = "Confirmar";
    }
    if (this.isUser) {
    }
    this.initMap();
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async confirm() {
    if (this.editable){
      if (this.actualMarker == null) {
        this.canExit();
      }else{
        return this.modalCtrl.dismiss(this.actualMarker.getLatLng(), 'confirm');
      }
    }
  }

  async canExit(){
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'No seleccionaste ninguna ubicacion, estas seguro de salir?',
      buttons: [
        {
          text: 'Si',
          role: 'confirm',
        },
        {
          text: 'No',
          role: 'cancel',
        },
      ],
    });

    actionSheet.present();

    const { role } = await actionSheet.onWillDismiss();

    if (role === 'confirm'){
      this.modalCtrl.dismiss(null, 'cancel');
    }
  };
  getIconMap(typePet,typePublication){

    if (this.isUser) {
      // TODO Aca se puede definir un icono para la seleccion de una organizacion
      return new L.Icon.Default();

    }
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

}
