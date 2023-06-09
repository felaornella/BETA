import { Usuario } from "./Usuario";

export class Publicacion {
    id: string;
    tipo: number;
    nombre: string;
    edad: number;
    edad_unidad: string;
    edad_aprox: boolean;
    edad_estimada: string;
    raza_mascota: string;
    raza_mascota_id: number;
    tipo_mascota: string;
    tipo_mascota_id: number;
    colores: Array<string>;
    size: string;
    sexo: string;
    created_at: string;
    geo_lat: number;
    geo_long: number;
    imagen: number;
    visible = true;
    distancia: string;
}

export class PublicacionDetalle {
    id: string;
    nombre: string;
    edad:  number;
    edad_unidad: string;
    edad_aprox: boolean;
    edad_estimada: string;
    colores: Array<string>;
    size:  string;
    sexo: string;
    caracteristicas: string;
    geo_lat: number;
    geo_long: number;
    tipo: number;

    estadoGeneral: number;
    castracion: boolean;
    vacunacion: string;
    patologias: string;
    medicacion: string;
    duracion_transito: string;
    tipo_mascota_id: number;
    tipo_mascota: string;
    raza_mascota_id: number;
    raza_mascota: string;
    enabled: boolean;
    created_at: string;
    updated_at: string;
    vencimiento: string;
    vencida: boolean;
    imagen: number;
    publicador: Usuario;

    mascota_id: string;
    tiempo_restante: string;
    retuvo:  boolean = false;
    contacto_anonimo: string;
}
export class ListadoPublicacionesDTO {
    publicaciones: Array<Publicacion>;
}
