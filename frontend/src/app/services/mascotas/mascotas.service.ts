import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Pet } from '../../models/Pet';
import { ListadoMascotas } from '../../models/Pet';
import { ToastController } from '@ionic/angular';
import { environment } from '../../../environments/environment';

import { AuthService } from '../auth/auth.service';
@Injectable({
  providedIn: 'root'
})
export class MascotasService {
  private URL_API= environment.baseApiUrl

  constructor(private http: HttpClient, private toastController: ToastController, private auth: AuthService) { }

  obtenerMascota(id: string){
    return this.http.get<Pet>(`${this.URL_API}/mascota/detalle/${id}`)
  }

  eliminar(id: string){
    return this.http.delete(`${this.URL_API}/mascota/eliminar/${id}`)
  }

  editarMascota(id: string, mascota: Pet, imagen){
    
    let body = new FormData()
    body.append("nombre",mascota.nombre)
    body.append("fecha_nacimiento",mascota.fecha_nacimiento)
    body.append("colores",mascota.colores.join(", "))
    body.append("size",mascota.size)
    body.append("sexo",mascota.sexo)
    if (mascota.caracteristicas != null && mascota.caracteristicas != "" && mascota.caracteristicas != undefined){
      body.append("caracteristicas",mascota.caracteristicas)
    }else {
      body.append("caracteristicas","")
    }
    body.append("castracion",String(mascota.castracion))
    body.append("vacunacion",mascota.vacunacion)
    if (mascota.cirugias != null && mascota.cirugias != "" && mascota.cirugias != undefined){
      body.append("cirugias",mascota.cirugias)
    }else {
      body.append("cirugias","")
    }
    if (mascota.enfermedades != null && mascota.enfermedades != "" && mascota.enfermedades != undefined){
      body.append("enfermedades",mascota.enfermedades)
    }else {
      body.append("enfermedades","")
    }
    if (mascota.medicacion != null && mascota.medicacion != "" && mascota.medicacion != undefined){
      body.append("medicacion",mascota.medicacion)
    }else {
      body.append("medicacion","")
    }

    body.append("tipo_mascota",String(mascota.tipo_mascota_id))
    body.append("raza_mascota",String(mascota.raza_mascota_id))
    if (imagen != null){
      body.append("imagen", imagen)
    }

    return this.http.post(`${this.URL_API}/mascota/editar/${id}`,body)
  }

  crearMascota(mascota: Pet, imagen){
    let body = new FormData()
    body.append("nombre",mascota.nombre)
    body.append("fecha_nacimiento",mascota.fecha_nacimiento)
    body.append("colores",mascota.colores.join(", "))
    body.append("size",mascota.size)
    body.append("sexo",mascota.sexo)
    if (mascota.caracteristicas != null && mascota.caracteristicas != "" && mascota.caracteristicas != undefined){
      body.append("caracteristicas",mascota.caracteristicas)
    }
    body.append("castracion",String(mascota.castracion))
    body.append("vacunacion",mascota.vacunacion)
    if (mascota.cirugias != null && mascota.cirugias != "" && mascota.cirugias != undefined){
      body.append("cirugias",mascota.cirugias)
    }
    if (mascota.enfermedades != null && mascota.enfermedades != "" && mascota.enfermedades != undefined){
      body.append("enfermedades",mascota.enfermedades)
    }
    if (mascota.medicacion != null && mascota.medicacion != "" && mascota.medicacion != undefined){
      body.append("medicacion",mascota.medicacion)
    }
    body.append("tipo_mascota",String(mascota.tipo_mascota_id))
    body.append("raza_mascota",String(mascota.raza_mascota_id))
    body.append("imagen", imagen)

    return this.http.post(`${this.URL_API}/mascota/nueva`,body)
  }

  obtenerQRMascota2(id: string, nombre_mascota: string){
    fetch(`${this.URL_API}/mascota/detalle/${id}/qr`)
    .then(resp => resp.blob())
    .then(resp => {
        const url = window.URL.createObjectURL(resp);
        const a = document.createElement('a');
        a.setAttribute("id","linkdescarga")
        a.style.display = 'none';
        a.href = url;
        a.download = "QR-Informacion-" + nombre_mascota + ".jpeg";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(document.getElementById("linkdescarga") as HTMLElement)
        this.presentToast("QR de acceso rapido a mascota descargado")
    })
    .catch((response) => {
      alert("Error descargando QR")
      return false
    });
    return true
  }

  obtenerQRMascota(id: string){
    window.open(`${this.URL_API}/mascota/detalle/${id}/qr?jwt=${this.auth.getCurrentToken()}`, '_blank');
  }

  mostrarQRNewOwner(id:string){
    return this.http.get(`${this.URL_API}/mascota/agregar_owner/${id}/qr`)
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: 'beta'
    });

    await toast.present();
  }

  agregarPorQR(url: string){
    return this.http.get(url)
  }


}