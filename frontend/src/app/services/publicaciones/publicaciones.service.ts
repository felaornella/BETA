/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ListadoPublicacionesDTO } from '../../models/Publicacion';
import { PublicacionDetalle } from '../../models/Publicacion';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class PublicacionesService {
  

  private URL_API= environment.baseApiUrl

  constructor(private http: HttpClient) { }

  obtenerAdopcionTransito(geopos){
    return this.http.get<ListadoPublicacionesDTO>(`${this.URL_API}/listado/adopcion_y_transito?geo_lat=${geopos[0]}&geo_long=${geopos[1]}`);
  }

  obtenerPerdidosEncontrados(geopos){
    return this.http.get<ListadoPublicacionesDTO>(`${this.URL_API}/listado/perdidos_y_encontrados?geo_lat=${geopos[0]}&geo_long=${geopos[1]}`);
  }

  obtenerPublicacionesPerdidosYEncontrados(){
    return this.http.get(`${this.URL_API}/listado/perdidos_y_encontrados`);
  }

  obtenerPublicacionesAdopcionYTransito(){
    return this.http.get(`${this.URL_API}/listado/adopcion_y_transito`);
  }

  obtenerRazas(){
    return this.http.get(`${this.URL_API}/listado/razas`);
  }

  obtenerColores(){
    return this.http.get(`${this.URL_API}/colores`);
  }

  obtenerPublicacion(id: string){
    return this.http.get(`${this.URL_API}/publicacion/detalle/${id}`);
  }

  obtenerMisPublicaciones(){
    return this.http.get(`${this.URL_API}/publicacion/mis_publicaciones`,{headers: {'X-JWT-Token': 'On'} });
  }

  obtenerPublicacionesMapa(geo_lat,geo_long){
    // as query params
    return this.http.get(`${this.URL_API}/listado/mapa?lat=${geo_lat}&long=${geo_long}`);
  }

  pausarPublicacion(idPublicacion){
    return this.http.post(`${this.URL_API}/publicacion/pausar/${idPublicacion}`,{});
  }

  reanudarPublicacion(idPublicacion){
    return this.http.post(`${this.URL_API}/publicacion/reanudar/${idPublicacion}`,{});
  }

  finalizarPublicacion(idPublicacion){
    return this.http.post(`${this.URL_API}/publicacion/finalizar/${idPublicacion}`,{});
  }

  eliminarPublicacion(idPublicacion){
    return this.http.delete(`${this.URL_API}/publicacion/eliminar/${idPublicacion}`,{});
  }

  crearPublicacion(publicacion:PublicacionDetalle, imagen, idMascota){
    let body = new FormData()

    if (idMascota == null){
      body.append("nombre", publicacion.nombre)
      if (publicacion.tipo == 2) {
        body.append("edad_estimada", publicacion.edad_estimada)
      }else{
        body.append("edad", String(publicacion.edad))
        body.append("edad_unidad", publicacion.edad_unidad)
      }
      body.append("colores", publicacion.colores?.join(", "))
      body.append("size", publicacion.size)
      body.append("sexo", publicacion.sexo)
      if (publicacion.caracteristicas != null || publicacion.caracteristicas != undefined){
        body.append("caracteristicas", publicacion.caracteristicas)
      }
      body.append("geo_lat", String(publicacion.geo_lat))
      body.append("geo_long", String(publicacion.geo_long))
      body.append("tipo", String(publicacion.tipo))
      body.append("castracion", String(publicacion.castracion))
      body.append("vacunacion", publicacion.vacunacion)
      if (publicacion.patologias != null || publicacion.patologias != undefined){
        body.append("patologias", publicacion.patologias)
      }
      if (publicacion.medicacion != null || publicacion.medicacion != undefined){
        body.append("medicacion", publicacion.medicacion)
      }
      body.append("retuvo", String(publicacion.retuvo))
      if (publicacion.tipo == 2 && publicacion.contacto_anonimo != "" && publicacion.contacto_anonimo != undefined){
        body.append("contacto_anonimo", publicacion.contacto_anonimo)
      }
      body.append("tipo_mascota", String(publicacion.tipo_mascota_id))
      body.append("raza_mascota", String(publicacion.raza_mascota_id))
      body.append("imagen", imagen)
      if (publicacion.tipo == 4){
        body.append("duracion_transito", publicacion.duracion_transito)
      }
    }else{
      body.append("id_mascota", idMascota)
      body.append("geo_lat", String(publicacion.geo_lat))
      body.append("geo_long", String(publicacion.geo_long))
      if (publicacion.tipo == 4){
        body.append("duracion_transito", publicacion.duracion_transito)
      }
    }
    

    return this.http.post(`${this.URL_API}/publicacion/nueva/${publicacion.tipo}`,body)
  }

  actualizarPublicacion(publicacion:PublicacionDetalle, imagen, idMascota, idPublicacion){
    let body = new FormData()

    if (idMascota == null){
      body.append("nombre", publicacion.nombre)
      if (publicacion.tipo == 2) {
        body.append("edad_estimada", publicacion.edad_estimada)
      }else{
        body.append("edad", String(publicacion.edad))
        body.append("edad_unidad", publicacion.edad_unidad)
      }
      body.append("colores", publicacion.colores?.join(", "))
      body.append("size", publicacion.size)
      body.append("sexo", publicacion.sexo)
      if (publicacion.caracteristicas != null || publicacion.caracteristicas != undefined){
        body.append("caracteristicas", publicacion.caracteristicas)
      }else {
        body.append("caracteristicas", "")
      }
      body.append("geo_lat", String(publicacion.geo_lat))
      body.append("geo_long", String(publicacion.geo_long))
      body.append("castracion", String(publicacion.castracion))
      body.append("vacunacion", publicacion.vacunacion)
      if (publicacion.patologias != null || publicacion.patologias != undefined){
        body.append("patologias", publicacion.patologias)
      }else {
        body.append("patologias", "")
      }
      if (publicacion.medicacion != null || publicacion.medicacion != undefined){
        body.append("medicacion", publicacion.medicacion)
      }else {
        body.append("medicacion", "")
      }
      body.append("retuvo", String(publicacion.retuvo))
      if (publicacion.tipo == 2 && publicacion.contacto_anonimo != "" && publicacion.contacto_anonimo != undefined){
        body.append("contacto_anonimo", publicacion.contacto_anonimo)
      }
      body.append("tipo_mascota", String(publicacion.tipo_mascota_id))
      body.append("raza_mascota", String(publicacion.raza_mascota_id))
      if (imagen != null){
        body.append("imagen", imagen)
      }
      if (publicacion.tipo == 4){
        body.append("duracion_transito", publicacion.duracion_transito)
      }
    }else{
      body.append("id_mascota", idMascota)
      body.append("geo_lat", String(publicacion.geo_lat))
      body.append("geo_long", String(publicacion.geo_long))
      if (publicacion.tipo == 4){
        body.append("duracion_transito", publicacion.duracion_transito)
      }
    }
    

    return this.http.post(`${this.URL_API}/publicacion/editar/${idPublicacion}`,body)
  }
  
}
