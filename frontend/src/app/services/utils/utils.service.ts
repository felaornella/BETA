import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ListadoColoresDTO } from 'src/app/models/Color';
import { ListadoRazasDTO } from 'src/app/models/Raza';
import { environment } from 'src/environments/environment';
import { Router, NavigationEnd } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  public previousURLs = []
  private URL_API= environment.baseApiUrl

  constructor(private http: HttpClient, private router: Router) { 
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousURLs.push(event.url);
      }
    });
  }

  getUltimasURL(){
    return this.previousURLs
  }

  obtenerRazasPorTipo(tipo){
    return this.http.get<ListadoRazasDTO>(`${this.URL_API}/listado/razas/${tipo}`);
  }

  obtenerRazas(){
    return this.http.get<ListadoRazasDTO>(`${this.URL_API}/listado/razas`);
  }

  obtenerColores(){
    return this.http.get<ListadoColoresDTO>(`${this.URL_API}/listado/colores`);
  } 

  obtenerTipos(){
    return this.http.get(`${this.URL_API}/listado/tipos`);
  } 
}
