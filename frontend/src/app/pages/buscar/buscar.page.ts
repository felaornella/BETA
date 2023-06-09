import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { getUrlImg } from 'src/app/utils/utils';
import { UsuariosService } from '../../services/usuarios/usuarios.service';

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.page.html',
  styleUrls: ['./buscar.page.scss'],
})
export class BuscarPage implements OnInit {
  getUrlImg = getUrlImg;

  text_busqueda = ""
  resultados: any[] =[];
  

  constructor(
    public navCtrl: NavController,
    private service: UsuariosService
  ) { }

  ngOnInit() {
  }

  busqueda(){
    this.resultados = []
    if (this.text_busqueda.length > 2){
      this.service.realizarBusqueda(this.text_busqueda).subscribe((data)=>{
        this.resultados = data["resultados"]
      })
    }
  }
  perfil(id){
    // this.navCtrl.navigateRoot("/")
    this.navCtrl.navigateForward('/perfil/'+id);
  }
}
