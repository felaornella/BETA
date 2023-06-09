export class Raza {
    id: number;
    nombre: string;
    tipo_mascota_id: number;
}
export class ListadoRazasDTO {
    razas: Array<Raza>;
}
