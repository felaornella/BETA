export class Pet{
    id: string;
    nombre: string;
    fecha_nacimiento: string;
    colores: Array<string>;
    edad: string;
    size: string;
    sexo: string;
    caracteristicas: string;
    castracion: boolean;
    vacunacion: string;
    enfermedades: string;
    cirugias: string;
    medicacion: string;
    raza_mascota_id: number;
    raza_mascota: string;
    tipo_mascota_id: number;
    tipo_mascota: string;
    perdido: boolean;
    enabled: boolean;
    created_at: Date;
    updated_at: Date;
    imagen: number;
}

export class ListadoMascotas{
    mascotas: Array<Pet>
}

export class MascotaPerfil {
    nombre: string;
    tipo_mascota: string;
    tipo_mascota_id: number;
}
