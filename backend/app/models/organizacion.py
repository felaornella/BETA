from app.db_sqlalchemy import db_sqlalchemy
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash

# from app.models.mascota import Mascota
from app.models.user_parent import UsuarioPadre

db = db_sqlalchemy
metadata = db.MetaData()


class Organizacion(db.Model):
    __tablename__ = "organizacion"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(255))
    descripcion_breve = db.Column(db.Text)
    link_donacion = db.Column(db.Text)
    dni_responsable = db.Column(db.String(255))
    nombre_responsable = db.Column(db.String(255))
    apellido_responsable = db.Column(db.String(255))
    fecha_creacion = db.Column(db.DateTime())
    geo_lat = db.Column(db.String(255))
    geo_long = db.Column(db.String(255))

    # Atributo usuario padre
    padre_id = db.Column(db.Integer, db.ForeignKey("usuario_padre.id"))
    padre = db.relationship("UsuarioPadre", backref="organizacion", lazy=True)

    def __init__(
        self,
        email,
        nombre,
        geo_lat,
        geo_long,
        instagram,
        telefono,
        descripcion_breve,
        link_donacion,
        dni_responsable,
        nombre_responsable,
        apellido_responsable,
        fecha_creacion,
        password,
    ):
        self.nombre = nombre
        self.geo_lat = geo_lat
        self.geo_long = geo_long
        self.descripcion_breve = descripcion_breve
        self.link_donacion = link_donacion
        self.dni_responsable = dni_responsable
        self.nombre_responsable = nombre_responsable
        self.apellido_responsable = apellido_responsable
        self.fecha_creacion = fecha_creacion
        self.padre = UsuarioPadre(email, telefono, password, instagram)

    @staticmethod
    def all():
        return Organizacion.query.all()

    def allEnabled():
        organizaciones = Organizacion.query.all()
        organizaciones_enabled = list(filter(lambda o: o.padre.enabled, organizaciones))
        return organizaciones_enabled

    def allEnabledCerca(geo_lat, geo_long):
        organizaciones = Organizacion.allEnabled()
        for each in organizaciones:
            each.distancia = Organizacion.calcularDistanciaEnKm(
                [float(each.geo_lat), float(each.geo_long)],
                [float(geo_lat), float(geo_long)],
            )
        organizaciones = list(filter(lambda o: o.distancia <= 25, organizaciones))
        organizaciones.sort(key=lambda o: o.distancia)
        return organizaciones

    def calcularDistanciaEnKm(geo1, geo2):
        from math import radians, cos, sin, asin, sqrt

        # The math module contains a function named
        # radians which converts from degrees to radians.
        geo1[1] = radians(geo1[1])
        geo1[0] = radians(geo1[0])
        geo2[1] = radians(geo2[1])
        geo2[0] = radians(geo2[0])

        # Haversine formula
        dlon = geo2[1] - geo1[1]
        dlat = geo2[0] - geo1[0]
        a = sin(dlat / 2) ** 2 + cos(geo1[0]) * cos(geo2[0]) * sin(dlon / 2) ** 2

        c = 2 * asin(sqrt(a))

        # Radius of earth in kilometers. Use 3956 for miles
        r = 6371

        # calculate the result
        return c * r

    def save(self):
        db.session.add(self)
        db.session.commit()
        return True

    def __repr__(self):
        return "<Organizacion {0} {1}>".format(
            self.nombre,
            self.descripcion_breve,
            self.link_donacion,
            self.dni_responsable,
            self.nombre_responsable,
            self.apellido_responsable,
            self.fecha_creacion,
        )

    def to_dict(self):
        # get to dict de usuario padre y agregarle los atributos de usuario
        dict = self.padre.to_dict()
        dict["nombre"] = self.nombre
        dict["geo_lat"] = self.geo_lat
        dict["geo_long"] = self.geo_long
        dict["descripcion_breve"] = self.descripcion_breve
        dict["link_donacion"] = self.link_donacion
        dict["dni_responsable"] = self.dni_responsable
        dict["nombre_responsable"] = self.nombre_responsable
        dict["apellido_responsable"] = self.apellido_responsable
        dict["fecha_creacion"] = self.fecha_creacion.strftime("%Y-%m-%d")
        dict["es_organizacion"] = True
        return dict

    def to_dict_filtrado(self):
        # get to dict de usuario padre y agregarle los atributos de usuario
        dict = self.padre.to_dict_filtrado()
        dict["nombre"] = self.nombre
        dict["geo_lat"] = self.geo_lat
        dict["geo_long"] = self.geo_long
        dict["descripcion_breve"] = self.descripcion_breve
        dict["link_donacion"] = self.link_donacion
        dict["dni_responsable"] = self.dni_responsable
        dict["nombre_responsable"] = self.nombre_responsable
        dict["apellido_responsable"] = self.apellido_responsable
        dict["es_organizacion"] = True
        dict["fecha_creacion"] = self.fecha_creacion.strftime("%Y-%m-%d")

        dict["mascotas"] = [
            {
                "nombre": m.nombre,
                "tipo_mascota_id": m.tipo_mascota_id,
                "tipo_mascota": m.tipo_mascota.tipo,
            }
            for m in self.padre.mascotas
        ]
        publis = self.padre.publicaciones
        publis.sort(key=lambda p: p.created_at, reversed=True)
        dict["publicaciones"] = [
            p.to_dict()
            for p in publis
            if p.enabled
            and p.estadoGeneral != 2
            and (p.vencimiento is None or p.vencimiento > datetime.now())
        ]

        return dict

    def buscarOrganizacionPorID(id):
        orga = Organizacion.query.filter_by(id=id).first()
        return orga

    def buscarOrganizacionPorIDPadre(id):
        orga = Organizacion.query.filter_by(padre_id=id).first()
        return orga

    def buscarSimilitud(info):
        organizaciones = Organizacion.query.all()
        return [
            org.to_dict()
            for org in list(
                filter(
                    lambda o: (
                        (
                            info in o.nombre
                            or info in o.nombre_responsable
                            or info in o.apellido_responsable
                            or info in o.padre.email[0 : o.padre.email.index("@")]
                        )
                        and o.padre.enabled
                    ),
                    organizaciones,
                )
            )
        ]
