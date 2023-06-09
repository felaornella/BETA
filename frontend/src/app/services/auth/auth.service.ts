import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Usuario } from 'src/app/models/Usuario';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  
  private URL_API= environment.baseApiUrl

  constructor(private http: HttpClient, private router: Router ) { 
  }

  register (usuario: Usuario,password: string){
    // send user in form-data
    let body = new FormData();
    
    body.append('es_organizacion', usuario.es_organizacion.toString());
    if (usuario.es_organizacion){
      body.append('geo_lat', usuario.geo_lat?.toString());
      body.append('geo_long', usuario.geo_long?.toString());
      body.append('descripcion_breve', usuario.descripcion_breve);
      if (usuario.fecha_creacion){
        body.append('fecha_creacion', usuario.fecha_creacion.toString());
      }
      body.append('link_donacion', usuario.link_donacion);
      body.append('dni_responsable', usuario.dni_responsable.toString());
      body.append('nombre_responsable', usuario.nombre_responsable);
      body.append('apellido_responsable', usuario.apellido_responsable);
    }else {
      body.append('apellido', usuario.apellido);
      if (usuario.fecha_nacimiento){
        body.append('fecha_nacimiento', usuario.fecha_nacimiento.toString());
      }
    }

    body.append('email', usuario.email);
    body.append('password', password);
    body.append('nombre', usuario.nombre);
    if (usuario.telefono){
      body.append('telefono', usuario.telefono);
    }
    if (usuario.instagram){
      body.append('instagram', usuario.instagram);
    }
   

    return this.http.post(this.URL_API + '/register', body);
  }

  login(user: any){
    // send user in form-data
    let body = new FormData();
    body.append('email', user.email);
    body.append('password', user.password);
    
    return this.http.post(this.URL_API + '/login', body);
  }

  logout() {
    // check if exist 
    if (localStorage.getItem('token') != null) {
      localStorage.removeItem("token");
    }
    if (localStorage.getItem('user_info') != null) {
      localStorage.removeItem("user_info");
    }
  }

  isLoggedIn() {
    return localStorage.getItem('token') !== null;
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  setCurrentToken(data): void {
    localStorage.setItem('token', data['token']);
  }

  setUserInfo(data):void {
    localStorage.setItem('user_info', JSON.stringify(data["user_info"]));
    if (JSON.stringify(data["email"])){
      localStorage.setItem('email_user', data["email"]);
    }
  }

  getCurrentToken(): String {
    return localStorage.getItem('token');
  }

  getUserInfo(): JSON {
    return JSON.parse(localStorage.getItem('user_info'));
  }

  verifyToken() {
    return this.http.get(this.URL_API + `/verifyToken/${this.getCurrentToken()}`);
  }

  forgotMyPassword (email) {
    let form = new FormData();
    form.append('email', email);

    return this.http.post(this.URL_API + `/recuperar`, form);
  }

  resetPassword(id,token,newPassword,duplicatedNewPassword){
    let form = new FormData();
    form.append('id', id);
    form.append('token', token);
    form.append('new_password', newPassword);
    form.append('duplicated_new_password', duplicatedNewPassword);

    return this.http.post(this.URL_API + `/reset_password`, form);
  }


  setGeoPosition(position) {
    localStorage.setItem('last_position', position.toString());
  }

  getLastGeoPosition() : Array<number> {
    return localStorage.getItem('last_position').split(',').map((item) => { return parseFloat(item) });
  }







  refreshToken() {
    const headers= new HttpHeaders({
      'Authorization': 'Bearer ' + this.getRefreshToken()
    })
    // refresh token and set new token
    return this.http.get(this.URL_API + `/refreshToken`, {headers: headers}).pipe(
      tap((data: any) => {
        this.setCurrentToken(data);
      })
    );
  }
  setRefreshToken(data) {
    localStorage.setItem('refresh_token', JSON.stringify(data['refresh_token']));
  }
  getRefreshToken() {
    if (localStorage.getItem('access_token') == null) {
      return '';
    }
    return localStorage.getItem('currentUser');
  }
}
