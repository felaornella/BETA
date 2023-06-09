import { Publicacion } from "./Publicacion";
import { MascotaPerfil } from "./Pet";

export class Usuario {
     // Usuario padre
     id: string;
     email: string;
     telefono: string;
     instagram: string;
     email_visible: boolean;
     instagram_visible: boolean;
     telefono_visible: boolean;
     imagen:string;
     enabled: boolean;
     suspendido: boolean;
     created_at: Date;
     
     //Diferenciador
     es_organizacion: boolean;
 
     //Comunes Hijo
     padre_id: number;

     // Usuario
     nombre: string; // Compartido con organizacion
     apellido: string;
     fecha_nacimiento: Date;
    
     // Organizacion
     descripcion_breve: string;
     geo_lat: number;
     geo_long: number;
     link_donacion: string;
     dni_responsable: number;
     nombre_responsable: string;
     apellido_responsable: string;
     cant_publicaciones: {};
     fecha_creacion: Date;

     publicaciones: Array<Publicacion>;
     mascotas: Array<MascotaPerfil>;
     puntaje: number;
}

export class ListadoOrganizaciones{
     organizaciones: Array<Usuario>;
}

