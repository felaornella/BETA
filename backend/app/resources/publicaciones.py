# Archivo con validacion de publicaciones

import datetime

from flask import jsonify

def getOrDefault (request,name,default=None):
    if request.form.get(name) is not None:
        return request.form.get(name)
    return default

def getBooleanOrDefault (request,name,default=False):
    if request.form.get(name) is not None:
        return request.form.get(name) == 'true'
    return default
def getDateOrDefault (request,name,default=None):
    if request.form.get(name) is not None:
        return datetime(   int(request.form.get(name).split("-")[0]), 
                                        int(request.form.get(name).split("-")[1]),
                                        int(request.form.get(name).split("-")[2]))
    return default


def validarVacio(string):
    if string is None or string.strip().replace(" ","") == "" or string == "undefined" or string == "null":
        return True
    return False

## Validar los siguientes campos que son obligatorios : nombre, edad (solo si el tipo no es 2), edad_unidad (solo si el tipo no es 2), edad_estimada (si es tipo 2), colores, size, sexo, geo_lat, geo_long, tipo_mascota, raza_mascota ,retuvo
## castracion (si es tipo 3 o 4), vacunacion (si es tipo 3 o 4), duracion_transito (si es tipo 4)

# Rescribir pero de una forma mas elegante, teniendo en cuenta los tipos necesarios
def validarRequestNuevaPublicacion(request,tipo):
    camposRequeridos = {
        "tipo": {
            "1": ["tipo_mascota","nombre","edad","edad_unidad","colores","size","sexo","geo_lat","geo_long","raza_mascota"],
            "2": ["tipo_mascota","edad_estimada","colores","size","sexo","geo_lat","geo_long","raza_mascota","retuvo"],
            "3": ["tipo_mascota","nombre","edad","edad_unidad","colores","size","sexo","geo_lat","geo_long","raza_mascota","castracion","vacunacion"],
            "4": ["tipo_mascota","nombre","edad","edad_unidad","colores","size","sexo","geo_lat","geo_long","raza_mascota","castracion","vacunacion","duracion_transito"]
        }
    }
    campos = {
        "nombre": "nombre",
        "edad": "edad",
        "edad_unidad": "unidad de edad",
        "edad_estimada": "edad estimada",
        "colores": "colores",
        "size": "tamaño",
        "sexo": "sexo",
        "geo_lat": "ubicacion",
        "geo_long": "ubicacion",
        "tipo_mascota": "tipo de la mascota",
        "raza_mascota": "raza de la mascota",
        "retuvo": "para saber si lo retuvo",
        "castracion": "castracion",
        "vacunacion": "vacunacion",
        "duracion_transito": "duracion del transito"
    }
    for campo in camposRequeridos["tipo"][str(tipo)]:
        print(campo + " " + request.form.get(campo))
        if validarVacio(request.form.get(campo)):
            return jsonify({'msg':'El campo '+campos[campo]+' es requerido'}),400,{'ContentType':'application/json'}
    return None

def validarRequestMascota(request):
    camposRequeridos = ["tipo_mascota","nombre","fecha_nacimiento","raza_mascota","colores","size","sexo","castracion","vacunacion"]
    campos = {
        "nombre": "nombre",
        "fecha_nacimiento": "fecha de nacimiento",
        "colores": "colores",
        "size": "tamaño",
        "sexo": "sexo",
        "tipo_mascota": "tipo de la mascota",
        "raza_mascota": "raza de la mascota",
        "castracion": "castracion",
        "vacunacion": "vacunacion"
    }

    for campo in camposRequeridos:
        if validarVacio(request.form.get(campo)):
            return jsonify({'msg':'El campo '+campos[campo]+' es requerido'}),400,{'ContentType':'application/json'}
    return None
