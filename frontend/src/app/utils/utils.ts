import { environment } from "src/environments/environment";

// Clase utils para obtener la url de la imagen
export function getUrlImg(id){
    return environment.baseApiUrl+`/imagen/${id}`;
}