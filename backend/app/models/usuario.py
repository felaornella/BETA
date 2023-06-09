from app.db_sqlalchemy import db_sqlalchemy
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash
from app.models.user_parent import UsuarioPadre

db = db_sqlalchemy
metadata = db.MetaData()


class Usuario(db.Model):
    __tablename__ = 'usuario'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    
    nombre = db.Column(db.String(255))
    apellido = db.Column(db.String(255))
    fecha_nacimiento = db.Column(db.DateTime())
    
     # Atributo usuario padre
    padre_id = db.Column(db.Integer, db.ForeignKey('usuario_padre.id'))
    padre = db.relationship('UsuarioPadre', backref='usuario', lazy=True)
   
    def __init__(self, email, nombre, apellido, telefono, fecha_nacimiento, password, instagram):
        self.nombre = nombre
        self.apellido = apellido
        self.fecha_nacimiento= fecha_nacimiento
        self.padre = UsuarioPadre(email, telefono, password, instagram)

    @staticmethod
    def all():
        return Usuario.query.all()

    def allActivos():
        return Usuario.query.filter_by(activo=True).all()
        

    def allEnabled():
        return Usuario.query.filter_by(enabled=True).all()
    
    def save(self):
        db.session.add(self)
        db.session.commit()
        return True

    def __repr__(self):
        return '<Usuario {0} {1} {2} {3} {4} {5} {6} {7} {8} {9} {10} {11} {12} {13} {14} {15}>'.format( self.padre.email,
                                                                                                        self.nombre,
                                                                                                        self.apellido,
                                                                                                        self.padre.telefono,
                                                                                                        self.fecha_nacimiento,
                                                                                                        self.padre.password,
                                                                                                        self.padre.instagram,
                                                                                                        self.padre.instagram_visible,
                                                                                                        self.padre.email_visible,
                                                                                                        self.padre.telefono_visible,
                                                                                                        self.padre.last_login,
                                                                                                        self.padre.suspendido,
                                                                                                        self.padre.enabled,
                                                                                                        self.padre.updated_at,
                                                                                                        self.padre.created_at
                                                                                                    )

    def to_dict(self):
        # get to dict de usuario padre y agregarle los atributos de usuario
        dict = self.padre.to_dict()
        dict["nombre"] = self.nombre
        dict["apellido"] = self.apellido
        dict["fecha_nacimiento"] = self.fecha_nacimiento.strftime("%Y-%m-%d")
        dict["es_organizacion"] = False
        dict["mascotas"] = [{'nombre': m.nombre, 'tipo_mascota_id': m.tipo_mascota_id, 'tipo_mascota': m.tipo_mascota.tipo} for m in self.padre.mascotas]

        return dict

    def to_dict_filtrado(self):
        # get to dict de usuario padre y agregarle los atributos de usuario
        dict = self.padre.to_dict_filtrado()
        dict["nombre"] = self.nombre
        dict["apellido"] = self.apellido
        dict["fecha_nacimiento"] = self.fecha_nacimiento.strftime("%Y-%m-%d")
        dict["es_organizacion"] = False
        dict["mascotas"] = [{'nombre': m.nombre, 'tipo_mascota_id': m.tipo_mascota_id, 'tipo_mascota': m.tipo_mascota.tipo} for m in self.padre.mascotas]
        dict["publicaciones"] = [p.to_dict() for p in self.padre.publicaciones if p.enabled and p.estadoGeneral != 2 and (p.vencimiento is None or p.vencimiento > datetime.now())]

        return dict


    def buscarUsuarioPorID(id):
        user = Usuario.query.filter_by(id=id).first()
        return user
    
    def buscarUsuarioPorIDPadre(id):
        user = Usuario.query.filter_by(padre_id=id).first()
        return user
    

    def buscarSimilitud(info):        
        usuarios = Usuario.query.all()
        return [user.to_dict() for user in list(
                                            filter(
                                                lambda u: (
                                                    (
                                                        info in u.nombre or 
                                                        info in u.apellido or 
                                                        info in u.padre.email[0:u.padre.email.index("@")]
                                                    ) and u.padre.enabled
                                                     ),usuarios
                                                )
                                            )]

