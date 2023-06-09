from app.db_sqlalchemy import db_sqlalchemy
from datetime import datetime

db = db_sqlalchemy
metadata = db.MetaData()


class Mascota(db.Model):
    __tablename__ = 'mascota'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(255))
    fecha_nacimiento = db.Column(db.DateTime())
    colores = db.Column(db.String(255), nullable=True)
    tamaño = db.Column(db.String(255))
    sexo = db.Column(db.String(255))
    caracteristicas = db.Column(db.String(255))
    castracion = db.Column(db.Boolean)
    vacunacion = db.Column(db.String(255))
    enfermedades = db.Column(db.Text)
    cirugias = db.Column(db.Text)
    medicacion = db.Column(db.Text)
    perdido = db.Column(db.Boolean)

    enabled = db.Column(db.Boolean)

    created_at = db.Column(db.DateTime(), nullable=True)
    updated_at = db.Column(db.DateTime(), nullable=True)
    
    # tipo mascota
    tipo_mascota_id = db.Column(db.Integer, db.ForeignKey('tipo_mascota.id'))

    # raza mascota
    raza_mascota_id = db.Column(db.Integer, db.ForeignKey('raza_mascota.id'))

    imagen_id = db.Column(db.Integer, db.ForeignKey('imagenes.id'))

    def __init__(self, nombre, fecha_nacimiento, colores, tamaño, sexo, caracteristicas, castracion, vacunacion, 
                enfermedades, cirugias, medicacion, tipo_mascota_id, raza_mascota_id):
        self.nombre = nombre
        self.fecha_nacimiento = fecha_nacimiento
        self.colores = colores
        self.tamaño = tamaño
        self.sexo = sexo
        self.caracteristicas = caracteristicas
        self.castracion = castracion
        self.vacunacion = vacunacion
        self.enfermedades = enfermedades
        self.cirugias = cirugias
        self.medicacion = medicacion
        
        self.raza_mascota_id = raza_mascota_id
        self.tipo_mascota_id = tipo_mascota_id
        
        self.perdido = False

        self.enabled = True
        
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    @staticmethod
    def all():
        return Mascota.query.all()

    def allActivos():
        return Mascota.query.filter_by(activo=True).all()
        

    def allEnabled():
        return Mascota.query.filter_by(enabled=True).all()
    
    def save(self):
        db.session.add(self)
        db.session.commit()
        return True

    def __repr__(self):
        return '<Mascota {0} {1} {2} {3} {4} {5} {6}>'.format( self.nombre,
                                                                    self.raza_mascota,
                                                                    self.dueños,
                                                                    self.tipo_mascota,
                                                                    self.enabled,
                                                                    self.updated_at,
                                                                    self.created_at
                                                                )

    def to_dict(self):
        years = round((datetime.now() - self.fecha_nacimiento).days / 365) if (datetime.now() - self.fecha_nacimiento).days % 365 < 183 else round((datetime.now() - self.fecha_nacimiento).days / 365) - 1
        if years == 0:
            months = round((datetime.now() - self.fecha_nacimiento).days / 30) if (datetime.now() - self.fecha_nacimiento).days % 30 < 15 else round((datetime.now() - self.fecha_nacimiento).days / 30) - 1
            if months == 1:
                edad = "{} mes".format(months)
            else:
                edad = "{} meses".format(months)
        elif years == 1:
            edad= "{} año".format(years)
        else:
            edad= "{} años".format(years)
            
        return {
                "id": self.id,
                "nombre": self.nombre,
                "fecha_nacimiento": self.fecha_nacimiento.strftime("%Y-%m-%d"),
                "edad": edad,
                "colores": self.colores.split(", "),
                "size": self.tamaño,
                "sexo": self.sexo,
                "caracteristicas": self.caracteristicas,
                "castracion": self.castracion,
                "vacunacion": self.vacunacion,
                "enfermedades": self.enfermedades,
                "cirugias": self.cirugias,
                "medicacion": self.medicacion,
                "raza_mascota": self.raza_mascota.raza,
                "raza_mascota_id": self.raza_mascota_id,
                "tipo_mascota": self.tipo_mascota.tipo,
                "tipo_mascota_id": self.tipo_mascota_id,
                "perdido": self.perdido,
                "enabled": self.enabled,
                "created_at": self.created_at,
                "updated_at": self.updated_at,
                "imagen": self.imagen_id,
            }

    def get_contactos(self):
        contactos = []
        for each in self.dueños:
            user = each.complete_dict()
            contactos.append({
                "nombre": user["nombre"],
                "contacto": user["telefono"] if user["telefono_visible"] else user["instagram"] if user["instagram_visible"] else user["email"]
            })
        return contactos
        
    def buscarMascotaPorID(id):
        pet = Mascota.query.filter_by(id=id).first()
        return pet

    def eliminar(self):
        self.enabled = False
        self.updated_at = datetime.now()

        self.save()
        return True

    def reportarPerdido(self):
        try:
            self.perdido = True
            self.updated_at = datetime.now()
            self.save()
            return True
        except:
            return False
