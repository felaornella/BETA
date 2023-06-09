from app.db_sqlalchemy import db_sqlalchemy
from datetime import datetime, timedelta

db = db_sqlalchemy
metadata = db.MetaData()

class Publicacion(db.Model):
    __tablename__ = 'publicacion'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    nombre = db.Column(db.String(255))
    edad = db.Column(db.Integer)
    edad_unidad = db.Column(db.String(255), nullable=True)
    edad_aprox = db.Column(db.Boolean)
    edad_estimada = db.Column(db.String(255), nullable=True)
    colores = db.Column(db.String(255), nullable=True)
    tamaño = db.Column(db.String(255))
    sexo = db.Column(db.String(255))
    caracteristicas = db.Column(db.String(255))
    castracion = db.Column(db.Boolean)
    vacunacion = db.Column(db.String(255))
    patologias = db.Column(db.String(255))
    medicacion = db.Column(db.String(255))

    mascota_id = db.Column(db.Integer)

    geo_lat = db.Column(db.String(255))
    geo_long = db.Column(db.String(255))

    tipo = db.Column(db.Integer)

    retuvo = db.Column(db.Boolean)
    contacto_anonimo = db.Column(db.String(255))

    estadoGeneral = db.Column(db.Integer)
    duracion_transito = db.Column(db.String(255))

    enabled = db.Column(db.Boolean)

    created_at = db.Column(db.DateTime(), nullable=True)
    updated_at = db.Column(db.DateTime(), nullable=True)
    vencimiento = db.Column(db.DateTime(), nullable=True)

    # tipo mascota
    tipo_mascota_id = db.Column(db.Integer, db.ForeignKey('tipo_mascota.id'))

    # raza mascota
    raza_mascota_id = db.Column(db.Integer, db.ForeignKey('raza_mascota.id'))

    publicador_id = db.Column(db.Integer, db.ForeignKey('usuario_padre.id'))

    imagen_id = db.Column(db.Integer, db.ForeignKey('imagenes.id'))


    def __init__(self, nombre, edad, edad_unidad, edad_aprox, edad_estimada, colores, tamaño, sexo, caracteristicas, geo_lat, 
                    geo_long, tipo, estadoGeneral, castracion, vacunacion, patologias, medicacion, 
                    duracion_transito, tipo_mascota_id, raza_mascota_id, publicador_id, mascota_id, retuvo, contacto_anonimo):
        self.nombre = nombre
        self.edad = edad
        self.edad_unidad = edad_unidad
        self.edad_aprox = edad_aprox
        self.edad_estimada = edad_estimada
        self.colores = colores
        self.tamaño = tamaño
        self.sexo = sexo
        self.caracteristicas = caracteristicas
        self.geo_lat = geo_lat
        self.geo_long = geo_long
        self.tipo = tipo
        self.estadoGeneral = estadoGeneral
        self.castracion = castracion
        self.vacunacion = vacunacion
        self.patologias = patologias
        self.medicacion = medicacion
        self.duracion_transito = duracion_transito
        
        self.tipo_mascota_id = tipo_mascota_id
        self.raza_mascota_id = raza_mascota_id
        self.publicador_id = publicador_id
        self.mascota_id = mascota_id
        self.retuvo = retuvo
        self.contacto_anonimo = contacto_anonimo

        self.enabled = True        
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
        self.vencimiento = datetime.now() + timedelta(days=2) if tipo == 2 and not retuvo else None

    @staticmethod
    def all():
        return Publicacion.query.all()

    def allActivos():
        return Publicacion.query.filter_by(activo=True).all()
        

    def allEnabled():
        return Publicacion.query.filter_by(enabled=True).all()

        
    def allEnabledPerdidosYEncontrados():
        return Publicacion.query.filter_by(enabled=True, tipo=1, estadoGeneral=1).all() + Publicacion.query.filter_by(enabled=True, tipo=2, estadoGeneral=1).all()

    def allEnabledAdopcionYTransito():
        return Publicacion.query.filter_by(enabled=True, tipo=3, estadoGeneral=1).all() + Publicacion.query.filter_by(enabled=True, tipo=4, estadoGeneral=1).all()

    def allEnabledPerdidosYEncontradosCerca(geo_lat, geo_long):
        publicaciones = Publicacion.allEnabledPerdidosYEncontrados()
        publis = []
        for each in publicaciones:
            publis.append([each, Publicacion.calcularDistanciaEnKm([float(each.geo_lat),float(each.geo_long)],[float(geo_lat),float(geo_long)])])
        publis = list(filter(lambda p: p[1] <= 25,publis))
        publis.sort(key= lambda p: p[1])
        return publis

    def allEnabledAdopcionYTransitoCerca(geo_lat, geo_long):
        publicaciones = Publicacion.allEnabledAdopcionYTransito()
        publis = []
        for each in publicaciones:
            publis.append([each, Publicacion.calcularDistanciaEnKm([float(each.geo_lat),float(each.geo_long)],[float(geo_lat),float(geo_long)])])
        publis = list(filter(lambda p: p[1] <= 25,publis))
        publis.sort(key= lambda p: p[1])
        return publis


    def allEnabledEnRango(geo_lat, geo_long, rango, tipo):
        publicaciones = Publicacion.query.filter_by(enabled=True, tipo=tipo, estadoGeneral=1).all()
        publicaciones = [p for p in publicaciones if p.vencimiento is None or p.vencimiento > datetime.now()]
        publis = []
        for each in publicaciones:
            distancia = Publicacion.calcularDistanciaEnKm([float(each.geo_lat),float(each.geo_long)],[float(geo_lat),float(geo_long)])
            if distancia <= rango:
                publis.append([each, distancia])
        publis.sort(key= lambda p: p[1])
        return publis





    def calcularDistanciaEnKm(geo1,geo2):
        from math import radians, cos, sin, asin, sqrt            
        # The math module contains a function named
        # radians which converts from degrees to radians.
        print(geo1, geo2)
        geo1[1] = radians(geo1[1])
        geo1[0] = radians(geo1[0])
        geo2[1] = radians(geo2[1])
        geo2[0] = radians(geo2[0])
        
        # Haversine formula
        dlon = geo2[1] - geo1[1]
        dlat = geo2[0] - geo1[0]
        a = sin(dlat / 2)**2 + cos(geo1[0]) * cos(geo2[0]) * sin(dlon / 2)**2
    
        c = 2 * asin(sqrt(a))
        
        # Radius of earth in kilometers. Use 3956 for miles
        r = 6371
        
        # calculate the result
        print(c * r, "km")
        return(c * r)

    # Devolver todas las publicaciones cercanas a lat y long 
    def allEnabledCercano(lat,long):
        publicaciones = [p for p in Publicacion.allEnabled() if p.estadoGeneral==1]
        publis = []
        for each in publicaciones:
            publis.append([each, Publicacion.calcularDistanciaEnKm([float(each.geo_lat),float(each.geo_long)],[float(lat),float(long)])])
        publis = list(filter(lambda p: p[1] <= 20,publis))
        publis.sort(key= lambda p: p[1])
        return publis

        
    def buscarPublicacionPorPublicador(id_publicador):
        return Publicacion.query.filter_by(publicador_id=id_publicador).all()

    def save(self):
        db.session.add(self)
        db.session.commit()
        return True

    def __repr__(self):
        return '<Publicacion {0} {1} {2} {3} {4} {5} {6}>'.format(  self.nombre,
                                                            self.raza_mascota,
                                                                self.tipo_mascota,
                                                                    self.publicador,
                                                                    self.imagen,
                                                                    float(self.geo_lat),
                                                                    float(self.geo_long)
                                                                )
    def to_dict(self):
        if self.vencimiento is None:
            tiempo_restante = ""
        else:
            dif = (self.vencimiento - datetime.now() ).total_seconds()
            if (dif / 3600) > 1:
                tiempo_restante = "({} horas restantes)".format(round(dif / 3600))
            else:
                tiempo_restante = "({} minutos restantes)".format(round(dif / 60))
        
        return {
                    "id": self.id,
                    "nombre": self.nombre,
                    "edad": self.edad,
                    "edad_unidad": self.edad_unidad,
                    "edad_aprox": self.edad_aprox,
                    "edad_estimada": self.edad_estimada,
                    "colores": self.colores.split(", "),
                    "size": self.tamaño,
                    "sexo": self.sexo,
                    "caracteristicas": self.caracteristicas,
                    "geoubicacion": "{},{}".format(self.geo_lat, self.geo_long),
                    "geo_lat": self.geo_lat,
                    "geo_long": self.geo_long,
                    "tipo": self.tipo,
                    "estadoGeneral": self.estadoGeneral,
                    "castracion": self.castracion,
                    "vacunacion": self.vacunacion,
                    "patologias": self.patologias,
                    "medicacion": self.medicacion,
                    "duracion_transito": self.duracion_transito,
                    "tipo_mascota_id": self.tipo_mascota_id,
                    "tipo_mascota": self.tipo_mascota.tipo,
                    "raza_mascota_id": self.raza_mascota_id,
                    "raza_mascota": self.raza_mascota.raza,
                    "enabled": self.enabled,
                    "created_at": self.created_at.strftime("%d/%m/%Y"),
                    "updated_at": self.updated_at.strftime("%d/%m/%Y"),
                    "vencimiento": self.vencimiento,
                    "vencida": self.vencimiento <= datetime.now() if self.vencimiento is not None else False,
                    "imagen": self.imagen_id,
                    "publicador": self.publicador.complete_dict() if self.publicador is not None else {"nombre": "Usuario", "apellido": "Anonimo", "instagram_visible": False, "email_visible": False, "telefono_visible": self.contacto_anonimo is not None,"telefono": self.contacto_anonimo},
                    "publicador_id": self.publicador_id,
                    "retuvo": self.retuvo,
                    "mascota_id": self.mascota_id,
                    "contacto_anonimo": self.contacto_anonimo,
                    "tiempo_restante": tiempo_restante
                }

    def dict_similares(self):
        dif = round((datetime.now() - self.created_at).total_seconds())
        if (dif / 3600) > 1:
            tiempo_llevado = "Hace {} horas".format(round(dif/3600))
        else:
            tiempo_llevado = "Hace {} minutos".format(round(dif/60))
        return {
                    "id": self.id,
                    "nombre": self.nombre,
                    "edad": self.edad,
                    "edad_unidad": self.edad_unidad,
                    "edad_aprox": self.edad_aprox,
                    "edad_estimada": self.edad_estimada,
                    "colores": self.colores,
                    "size": self.tamaño,
                    "sexo": self.sexo,
                    "tipo_mascota": self.tipo_mascota.tipo,
                    "raza_mascota": self.raza_mascota.raza,
                    "imagen": self.imagen_id,
                    "tiempo_llevado": tiempo_llevado
                }
    def buscarPublicacionActivaPorMascota(id_mascota, tipo):
        pubs = Publicacion.query.filter_by(mascota_id=id_mascota, enabled= 1, tipo=tipo).all()
        for p in pubs:
            if (p.estadoGeneral in [1,2] and p.vencimiento is None) or (p.estadoGeneral in [1,2] and p.vencimiento > datetime.now()):
                return p
        return None

    def buscarPublicacionPorID(id):
        pub = Publicacion.query.filter_by(id=id).first()
        return pub

    def eliminar(self):
        self.enabled = False
        self.updated_at = datetime.now()

        self.save()
        return True

