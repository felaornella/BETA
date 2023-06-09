from cgitb import enable
from sqlalchemy.orm import query
from app.db_sqlalchemy import db_sqlalchemy
from datetime import datetime
from app.models.user_parent import UsuarioPadre
from app.models.publicacion import Publicacion
from app.models.mascota import Mascota

db = db_sqlalchemy
metadata= db.MetaData()

class Imagen(db.Model):
    __tablename__ = 'imagenes'
    id = db.Column(db.Integer, primary_key=True)
    contenido = db.Column(db.LargeBinary(length=(2**32)-1))

    created_at = db.Column(db.DateTime(), nullable=True)
    updated_at = db.Column(db.DateTime(), nullable=True)

    imagen_perfil = db.relationship(UsuarioPadre, uselist=False, backref="imagen")
    imagen_publicacion = db.relationship(Publicacion, uselist=False, backref="imagen")
    imagen_mascota = db.relationship(Mascota, uselist=False, backref="imagen")

    
    def __init__(self, contenido):
        self.contenido = contenido

        today = datetime.now()
        self.created_at = today.strftime("%Y-%m/%d, %H:%M:%S")
        self.updated_at = today.strftime("%Y-%m/%d, %H:%M:%S")

    @staticmethod
    def all():
        return Imagen.query.all()

    def allEnabled():
        return Imagen.query.filter_by(enabled=True).all()

    def save(self):
        db.session.add(self)
        db.session.commit()
        return True
    
    def to_dict(self):
        return {
            'id': self.id,
            'contenido': self.contenido
        }

    def __repr__(self):
        return '<Imagen {0} {1} {2} {3}>'.format(self.id,
                                                            self.contenido,
                                                            self.created_at,
                                                            self.updated_at
                                                              )