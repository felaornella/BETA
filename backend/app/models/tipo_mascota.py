from app.db_sqlalchemy import db_sqlalchemy
from datetime import datetime
from app.models.publicacion import Publicacion
from app.models.raza_mascota import Raza_Mascota
from app.models.mascota import Mascota
db = db_sqlalchemy
metadata = db.MetaData()

class Tipo_Mascota(db.Model):
    __tablename__ = 'tipo_mascota'
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(255))
    publicaciones = db.relationship(Publicacion, backref='tipo_mascota', lazy=True)
    razas = db.relationship(Raza_Mascota, backref='tipo_mascota', lazy=True)

    mascotas = db.relationship(Mascota, backref='tipo_mascota', lazy=True)


    def __init__(self, tipo):
        self.tipo =  tipo

    @staticmethod
    def all():
        return Tipo_Mascota.query.all()

    def save(self):
        db.session.add(self)
        db.session.commit()
        return True

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.tipo,
        }

    def buscarPorId(id):
        return Tipo_Mascota.query.filter_by(id=id).first()