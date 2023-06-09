from app.db_sqlalchemy import db_sqlalchemy
from datetime import datetime
from app.models.publicacion import Publicacion
from app.models.mascota import Mascota
db = db_sqlalchemy
metadata = db.MetaData()

class Raza_Mascota(db.Model):
    __tablename__ = 'raza_mascota'
    id = db.Column(db.Integer, primary_key=True)
    
    raza = db.Column(db.String(255))
    tipo_mascota_id = db.Column(db.Integer, db.ForeignKey('tipo_mascota.id'))
    publicaciones = db.relationship(Publicacion, backref='raza_mascota', lazy=True)
    mascotas = db.relationship(Mascota, backref='raza_mascota', lazy=True)


    def __init__(self, raza):
        self.raza =  raza

    @staticmethod
    def all():
        return Raza_Mascota.query.all()

    def save(self):
        db.session.add(self)
        db.session.commit()
        return True

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.raza,
            "tipo_mascota_id": self.tipo_mascota_id
        }

    def buscarPorId(id):
        return Raza_Mascota.query.filter_by(id=id).first()