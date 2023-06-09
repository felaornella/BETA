import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Usuario } from '../../models/Usuario';
import { ListadoOrganizaciones } from '../../models/Usuario';
import { ListadoMascotas } from '../../models/Pet';
import { environment } from 'src/environments/environment';
import { formatNumber } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  actualizarPassword(actualPassword: any, newPassword: any, duplicatedNewPassword: any) {
    var form = new FormData();
    form.append('actual_password', actualPassword);
    form.append('new_password', newPassword);
    form.append('duplicated_new_password', duplicatedNewPassword);
    return this.http.post(`${this.URL_API}/perfil/actualizar_password`, form); 
  }

  private URL_API= environment.baseApiUrl

  constructor(private http: HttpClient) { }

  obtenerMiPerfil(){
    return this.http.get<Usuario>(`${this.URL_API}/perfil/mi_perfil`)
  }

  obtenerUsuario(id: string){
    return this.http.get<Usuario>(`${this.URL_API}/profile/${id}`)
  }

  obtenerOrganizaciones(geopos){
    return this.http.get<ListadoOrganizaciones>(`${this.URL_API}/listado/organizaciones?geo_lat=${geopos[0]}&geo_long=${geopos[1]}`)
  }

  realizarBusqueda(input: string){
    return this.http.get(`${this.URL_API}/perfil/busqueda/${input}`)
  }

  misMascotas(){
    return this.http.get(`${this.URL_API}/mascota/mis_mascotas`)
  }

  actualizarMiPerfil(usuario: Usuario, imagen){
    var form = new FormData();
    //console.log(usuario)
    form.append('nombre', usuario.nombre);
    form.append('es_organizacion', usuario.es_organizacion.toString());
    if (usuario.es_organizacion){
      form.append('geo_lat', usuario.geo_lat?.toString());
      form.append('geo_long', usuario.geo_long?.toString());
      form.append('descripcion_breve', usuario.descripcion_breve);
      form.append('link_donacion', usuario.link_donacion);
      form.append('dni_responsable', usuario.dni_responsable?.toString());
      form.append('nombre_responsable', usuario.nombre_responsable);
      form.append('apellido_responsable', usuario.apellido_responsable);
      form.append('fecha_creacion', usuario.fecha_creacion?.toString());

    }else {
      form.append('apellido', usuario.apellido);
      form.append('fecha_nacimiento', usuario.fecha_nacimiento?.toString());
    }
    
    
    form.append('telefono_visible', usuario.telefono_visible?.toString());
    form.append('telefono', usuario.telefono);
   
    form.append('instagram_visible', usuario.instagram_visible?.toString());
    form.append('instagram', usuario.instagram);
    

    form.append('email_visible', usuario.email_visible.toString());
    if (imagen != null){
      form.append("imagen", imagen)
    }

    return this.http.post(`${this.URL_API}/perfil/editar`, form)
  }

}
