from app.db_sqlalchemy import db_sqlalchemy
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash
from app.models.mascota import Mascota
from app.models.publicacion import Publicacion
db = db_sqlalchemy
metadata = db.MetaData()
usuario_mascota = db.Table('usuario_mascota',db.Column('user_id', db.Integer, db.ForeignKey('usuario_padre.id'), primary_key=True),
                     db.Column('mascota_id', db.Integer, db.ForeignKey('mascota.id'), primary_key=True))

class UsuarioPadre(db.Model):
    __tablename__ = 'usuario_padre'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255),unique=True)
    telefono = db.Column(db.String(255))
    password = db.Column(db.String(255))
    instagram = db.Column(db.String(255), nullable=True)
    instagram_visible = db.Column(db.Boolean)
    telefono_visible = db.Column(db.Boolean)
    email_visible = db.Column(db.Boolean)
    suspendido = db.Column(db.Boolean)
    enabled = db.Column(db.Boolean)

    recuperarPass = db.Column(db.Boolean)
    tempPass = db.Column(db.String(255))

    forced_logout = db.Column(db.Boolean)

    last_login = db.Column(db.DateTime(), nullable=True)

    created_at = db.Column(db.DateTime(), nullable=True)
    updated_at = db.Column(db.DateTime(), nullable=True)

    mascotas = db.relationship('Mascota', secondary=usuario_mascota, lazy='subquery', backref=db.backref('dueños', lazy=True))

    publicaciones = db.relationship(Publicacion, backref='publicador', lazy=True)
        
    imagen_id = db.Column(db.Integer, db.ForeignKey('imagenes.id'))


    def __init__(self, email, telefono, password, instagram):
        self.email = email
        self.telefono = telefono
        self.password = generate_password_hash(password, "sha256", 32)
        self.instagram = instagram

        self.instagram_visible = False
        self.email_visible = True
        self.telefono_visible = False

        self.recuperarPass=False
        self.tempPass=None
        
        self.forced_logout = False
        self.suspendido = False
        self.enabled = True
        
        self.last_login = datetime.now()
        
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "telefono": self.telefono,
            "instagram": self.instagram,
            "instagram_visible": self.instagram_visible,
            "email_visible": self.email_visible,
            "telefono_visible": self.telefono_visible,
            "imagen": self.imagen_id,
            "enabled": self.enabled,
            "suspendido": self.suspendido,
            "created_at": self.created_at,
            "puntaje": len([p for p in self.publicaciones if p.tipo == 2 and p.enabled])
        }

    def to_dict_filtrado(self):
        dic = {
            "id": self.id,
            "imagen": self.imagen_id,
            "enabled": self.enabled,
            "suspendido": self.suspendido,
            "created_at": self.created_at,
            "puntaje": len([p for p in self.publicaciones if p.tipo == 2 and p.enabled])
        }
        if self.email_visible:
            dic["email"] = self.email
            dic["email_visible"] = True
        if self.telefono_visible:
            dic["telefono"] = self.telefono
            dic["telefono_visible"] = True
        if self.instagram_visible:
            dic["instagram"] = self.instagram
            dic["instagram_visible"] = True

        return dic

    def complete_dict(self):
        from app.models.usuario import Usuario
        from app.models.organizacion import Organizacion
        
        usuario = Usuario.buscarUsuarioPorIDPadre(self.id)
        if usuario is not None:
            return usuario.to_dict()
        organizacion = Organizacion.buscarOrganizacionPorIDPadre(self.id)
        if organizacion is not None:
            return organizacion.to_dict()

    def complete_dict_filtrado(self):
        from app.models.usuario import Usuario
        from app.models.organizacion import Organizacion

        usuario:Usuario = Usuario.buscarUsuarioPorIDPadre(self.id)
        if usuario is not None:
            return usuario.to_dict_filtrado()
        organizacion:Organizacion = Organizacion.buscarOrganizacionPorIDPadre(self.id)
        if organizacion is not None:
            return organizacion.to_dict_filtrado()


    def get_hijo(self):
        from app.models.usuario import Usuario
        from app.models.organizacion import Organizacion

        usuario:Usuario = Usuario.buscarUsuarioPorIDPadre(self.id)
        if usuario is not None:
            return usuario
        organizacion:Organizacion = Organizacion.buscarOrganizacionPorIDPadre(self.id)
        if organizacion is not None:
            return organizacion


    @staticmethod
    def all():
        return UsuarioPadre.query.all()

    def allActivos():
        return UsuarioPadre.query.filter_by(activo=True).all()
        

    def allEnabled():
        return UsuarioPadre.query.filter_by(enabled=True).all()
    
    def save(self):
        db.session.add(self)
        db.session.commit()
        return True

    def __repr__(self):
        return '<Usuario {0} {1} {2} {3} {4} {5} {6} {7} {8} {9} {10} {11} {12}>'.format( self.email,
                                                                                            self.telefono,
                                                                                            self.password,
                                                                                            self.instagram,
                                                                                            self.instagram_visible,
                                                                                            self.email_visible,
                                                                                            self.telefono_visible,
                                                                                            self.last_login,
                                                                                            self.suspendido,
                                                                                            self.enabled,
                                                                                            self.updated_at,
                                                                                            self.created_at,
                                                                                            self.imagen
                                                                                        )

    def buscarUsuarioPorID(id):
        user = UsuarioPadre.query.filter_by(id=id).first()
        return user
    
    def buscarUsuarioPorEmail(email):
        user = UsuarioPadre.query.filter_by(email=email).first()
        return user

    def agregarMascota(self, mascota):
        self.mascotas.append(mascota)

    def eliminarUsuario(id):
        usu:UsuarioPadre = UsuarioPadre.buscarUsuarioPorID(id)

        if usu is not None:
            usu.enabled = False
            usu.suspendido = True
            usu.forced_logout = True
            usu.updated_at = datetime.now()

            usu.save()
            return True
        return False

    def validarDatosEntrada(email, password):
        user = UsuarioPadre.query.filter_by(email=email, enabled=True).first()
        if user is not None and user.password is not None and check_password_hash(user.password,password):
            return user
        else:
            return None

    def buscarRecuperacion(email, code):
        user= UsuarioPadre.query.filter_by(email=email,enabled=True,recuperarPass=True).first()
        if user is not None:
            if check_password_hash(user.tempPass, code.upper()):
                return user
        return None
        
    def comprobarContraseña(usuId, passw):
        user = UsuarioPadre.query.filter_by(id=usuId).first()
        return check_password_hash(user.password,passw)

    def comprobarRecuperacion(usuId, passw):
        user = UsuarioPadre.query.filter_by(id=usuId,enabled=True,recuperarPass=True).first()
        if user is not None:
            if check_password_hash(user.tempPass, passw.upper()):
                return user
        return None

    def updatePassword(id,passw):
        user:UsuarioPadre = UsuarioPadre.query.filter_by(id=id).first()
        user.password= generate_password_hash(passw, "sha256", 32)
        user.updated_at=datetime.now()
        return user.save()

    def validarEmail(email):
        user = UsuarioPadre.query.filter_by(email=email).first()
        if user is None:
            return True
        return False
