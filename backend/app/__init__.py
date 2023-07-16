from datetime import datetime, timedelta
from os import path, environ
from tabnanny import check
from PIL import Image
from flask import Flask, render_template, g, session, redirect, url_for, jsonify, Response
from flask_session import Session
from app.resources.publicaciones import validarRequestNuevaPublicacion, validarRequestMascota
from config import config
from app import db
from dotenv import load_dotenv
from app.db_sqlalchemy import db_sqlalchemy
from flask import request
from flask_bootstrap import Bootstrap
from flask_cors import CORS
from flask_login import LoginManager, current_user,login_user,login_required,logout_user
from app.models.user_parent import UsuarioPadre
from app.models.usuario import Usuario
from app.models.organizacion import Organizacion
from app.models.publicacion import Publicacion
from app.models.imagen import Imagen
from app.models.mascota import Mascota
from app.models.tipo_mascota import Tipo_Mascota
from app.models.raza_mascota import Raza_Mascota
from app.models.publicacion import Publicacion


from app.helpers.wrappers import es_organizacion, es_usuario
from functools import wraps
from flask_jwt_extended import create_access_token, get_jwt_identity, get_jwt, jwt_required, unset_jwt_cookies, set_access_cookies
from flask_jwt_extended import JWTManager
from datetime import timezone
from app.resources import email_service
from werkzeug.security import generate_password_hash, check_password_hash


# https://stackoverflow.com/questions/70071418/flask-jwt-extended-missing-csrf-access-token

# env="development"
env="testing"
# env="production"
def create_app(environment=env):
    load_dotenv()

    # Configuración inicial de la app
    app = Flask(__name__)
    cors = CORS(app)
    app.config['CORS_HEADERS'] = 'Content-Type'

    # Carga de la configuración
    env = environ.get("FLASK_ENV", environment)
    app.config.from_object(config[env])
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_POOL_RECYCLE'] = 250
    app.config['SECRET_KEY'] = b'6hc/_gsh,./;2ZZx3c6_s,1//'

    # Server Side session
    app.config["SESSION_TYPE"] = "filesystem"
    app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(minutes=60*24*365)
    Session(app)
    Bootstrap(app)

    # Setup the Flask-JWT-Extended extension
    app.config["JWT_COOKIE_SECURE"] = False
    app.config["JWT_TOKEN_LOCATION"] = ["headers", "query_string"]
    app.config["JWT_SECRET_KEY"] = "YmV0YV9hcHA="
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=365)
    jwt = JWTManager(app)

    # Configure db


    # Configure sqlAlchemy
    conf = app.config
    app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+pymysql://" + \
        conf["DB_USER"]+":"+conf["DB_PASS"]+"@" + \
        conf["DB_HOST"]+"/"+conf["DB_NAME"] + "?charset=utf8mb4"
    db_sqlalchemy.init_app(app)
    db.init_db(app)

    # Configure secure_filename
    UPLOAD_FOLDER = 'static/uploads'
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


    # Generales ------------------------------------------------------------------------------------
    @app.route("/system_check_pool",methods=["GET"])
    def check_forced_logout():
        try:
            if not current_user.is_authenticated:
                return jsonify({'message':"Sin Autorización"}), 401, {'ContentType':'application/json'}

            if current_user.is_forced_logout():
                if current_user.admin is not None:
                    current_user.admin.forced_logout = False
                    current_user.admin.save()
                else:
                    current_user.alum.forced_logout = False
                    current_user.alum.save()
                return jsonify({'value':True}), 200, {'ContentType':'application/json'}
            return jsonify({'value':False}), 200, {'ContentType':'application/json'}
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':"Server Error: Codigo 1743"}), 400, {'ContentType':'application/json'}

    #### AUTENTICACION ===========================================================================================================

    @app.route("/login", methods=["POST"])
    def login():
        try:
            email = request.form.get("email", None)
            if email is None or email == "":
                return jsonify({'msg':'El email es obligatorio'}),400,{'ContentType':'application/json'}
            password = request.form.get("password", None)
            if password is None or password == "":
                return jsonify({'msg':'La contraseña es obligatoria'}),400,{'ContentType':'application/json'}

            user = UsuarioPadre.validarDatosEntrada(email, password)

            if user is None:

                user = UsuarioPadre.buscarRecuperacion(email, password)

                if user is None:
                    return jsonify({'msg':'Email o contraseña incorrectos'}),401,{'ContentType':'application/json'}

                user.last_login=datetime.now()
                user.forced_logout=False
                user.save()
                #access_token = create_access_token(identity=[email,user.id])
                user_info = {
                    "id": user.id,
                    "nombre": user.get_hijo().nombre,
                    "apellido": user.get_hijo().apellido if type(user.get_hijo()).__name__=="Usuario" else "",
                    "es_organizacion": type(user.get_hijo()).__name__ == "Organizacion",
                    "recuperacion": True,
                }
                return jsonify({'msg':'Inicio de sesion con codigo de recuperación. Debe actualizar su contraseña','user_info': user_info,'email':user.email}),203,{'ContentType':'application/json'}


            user.last_login=datetime.now()
            user.forced_logout=False
            user.save()
            access_token = create_access_token(identity=[email,user.id])
            user_info = {
                "id": user.id,
                "nombre": user.get_hijo().nombre,
                "apellido": user.get_hijo().apellido if type(user.get_hijo()).__name__=="Usuario" else "",
                "es_organizacion": type(user.get_hijo()).__name__ == "Organizacion"
            }
            response = jsonify({"msg": "Login exitoso", "token": access_token, "user_info": user_info})

            return response
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error validando los datos'}),400,{'ContentType':'application/json'}

    def validateRegisterOrganizacion (form):
        nombreOrganizacion = request.form.get("nombre", None)
        if nombreOrganizacion is None or nombreOrganizacion == "":
            return jsonify({'msg':'El nombre de la organizacion es obligatorio'}),400,{'ContentType':'application/json'}
        descripcion = request.form.get("descripcion_breve", None)
        if descripcion is None or descripcion == "":
            return jsonify({'msg':'La descripcion es obligatoria'}),400,{'ContentType':'application/json'}
        email = request.form.get("email", None)
        if email is None or email == "":
            return jsonify({'msg':'El email es obligatorio'}),400,{'ContentType':'application/json'}
        geo_lat = request.form.get("geo_lat", None)
        geo_long = request.form.get("geo_long", None)
        if geo_lat is None or geo_lat == "" or geo_long is None or geo_long == "":
            return jsonify({'msg':'La ubicacion es obligatoria'}),400,{'ContentType':'application/json'}

        dniResponsable = request.form.get("dni_responsable", None)
        if dniResponsable is None or dniResponsable == "":
            return jsonify({'msg':'El dni del responsable es obligatorio'}),400,{'ContentType':'application/json'}

        nombreResponsable = request.form.get("nombre_responsable", None)
        if nombreResponsable is None or nombreResponsable == "":
            return jsonify({'msg':'El nombre del responsable es obligatorio'}),400,{'ContentType':'application/json'}

        apellidoResponsable = request.form.get("apellido_responsable", None)
        if apellidoResponsable is None or apellidoResponsable == "":
            return jsonify({'msg':'El apellido del responsable es obligatorio'}),400,{'ContentType':'application/json'}

        fecha_creacion = request.form.get("fecha_creacion", None)
        if fecha_creacion is None or fecha_creacion == "":
            return jsonify({'msg':'La fecha de creacion es obligatoria'}),400,{'ContentType':'application/json'}
        try:
            fecha_creacion = datetime.strptime(fecha_creacion, '%Y-%m-%d')
        except ValueError:
            return jsonify({'msg':'La fecha de creacion no es valida'}),400,{'ContentType':'application/json'}

        password = request.form.get("password", None)
        if password is None or password == "":
            return jsonify({'msg':'La contraseña es obligatoria'}),400,{'ContentType':'application/json'}

        return None

    def validateRegisterUsuario (form):
        nombre = request.form.get("nombre", None)
        if nombre is None or nombre == "":
            return jsonify({'msg':'El nombre es obligatorio'}),400,{'ContentType':'application/json'}
        apellido = request.form.get("apellido", None)
        if apellido is None or apellido == "":
            return jsonify({'msg':'El apellido es obligatorio'}),400,{'ContentType':'application/json'}
        email = request.form.get("email", None)
        if email is None or email == "":
            return jsonify({'msg':'El email es obligatorio'}),400,{'ContentType':'application/json'}
        fecha_nacimiento = request.form.get("fecha_nacimiento", None)
        if fecha_nacimiento is None or fecha_nacimiento == "":
            return jsonify({'msg':'La fecha de nacimiento es obligatoria'}),400,{'ContentType':'application/json'}
        try:
            fecha_nacimiento = datetime.strptime(fecha_nacimiento, '%Y-%m-%d')
        except ValueError:
            return jsonify({'msg':'La fecha de nacimiento no es valida'}),400,{'ContentType':'application/json'}
        password = request.form.get("password", None)
        if password is None or password == "":
            return jsonify({'msg':'La contraseña es obligatoria'}),400,{'ContentType':'application/json'}
        return None


    @app.route("/register", methods=["POST"])
    def register():
        try:
            es_organizacion = request.form.get("es_organizacion", None)
            usuario, organizacion, email = None, None, None

            # Si no es organizacion recibe nombre, apellido, email, fecha de nacimiento, telefono, contrasenia
            if es_organizacion == "false":
                validation = validateRegisterUsuario(request.form)
                if validation is not None:
                    return validation
                email = request.form.get("email", None)

                if not UsuarioPadre.validarEmail(email):
                    return jsonify({'msg':'El email ingresado ya se encuentra registrado'}),400,{'ContentType':'application/json'}

                #Crear usuario padre con los datos recibidos
                usuario = Usuario(
                    email,
                    request.form.get("nombre"),
                    request.form.get("apellido"),
                    request.form.get("telefono", None),
                    datetime.strptime(request.form.get("fecha_nacimiento"), '%Y-%m-%d'),
                    request.form.get("password"),
                    request.form.get("instagram", None))


                usuario.save()

            if es_organizacion == "true":
                validacion = validateRegisterOrganizacion(request.form)
                if validacion is not None:
                    return validacion

                email = request.form.get("email", None)

                #crear organizacion
                organizacion = Organizacion(
                    request.form.get("email"),
                    request.form.get("nombre"),
                    request.form.get("geo_lat"),
                    request.form.get("geo_long"),
                    request.form.get("instagram", None),
                    request.form.get("telefono", None),
                    request.form.get("descripcion_breve"),
                    request.form.get("link_donacion",None),
                    request.form.get("dni_responsable"),
                    request.form.get("nombre_responsable"),
                    request.form.get("apellido_responsable"),
                    request.form.get("fecha_creacion"),
                    request.form.get("password"))
                organizacion.save()

            if email is not None:
                # Iniciar sesion
                access_token = create_access_token(identity=[email, usuario.padre_id]) if usuario is not None else create_access_token(identity=[email, organizacion.padre_id])
                user_info = {
                    "id": usuario.padre_id if usuario is not None else organizacion.padre_id,
                    "nombre": usuario.nombre if usuario is not None else organizacion.nombre,
                    "apellido": usuario.apellido if usuario is not None else "",
                    "es_organizacion": organizacion is not None
                }
                response = jsonify({'msg':'Registro finalizado exitosamente',"token": access_token, "user_info": user_info})

                return response
            else:
                return jsonify({'msg':'Faltan datos para completar el registro'}),400,{'ContentType':'application/json'}

        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error registrando los datos'}),400,{'ContentType':'application/json'}

    #@jwt_required(optional=True)
    @app.route("/recuperar", methods=["POST"])
    def recuperar():
        try:
            #if get_jwt_identity() is not None:
            #    return jsonify({'msg':'Usuario loggeado'}),401,{'ContentType':'application/json'}

            email = request.form.get("email", None)
            if email is None or email == "":
                return jsonify({'msg':'Email es obligatorio'}),400,{'ContentType':'application/json'}

            user = UsuarioPadre.buscarUsuarioPorEmail(email)

            if user is None:
                return jsonify({'msg':'El email ingresado no pertenece a ninguna cuenta'}),400,{'ContentType':'application/json'}
            else:
                import random
                import string
                lower = string.ascii_lowercase
                upper = string.ascii_uppercase
                num = string.digits
                all= lower + upper + num
                tempPass="".join(random.sample(all,10)).upper()


                user.recuperarPass = True
                user.tempPass = generate_password_hash(tempPass, "sha256", 32)
                user.save()

                if email_service.enviar_mail_recuperacion(user, tempPass):
                    return jsonify({'msg':'Email enviado exitosamente'}),200,{'ContentType':'application/json'}
                else:
                    return jsonify({'msg':'Ocurrio un error al enviar el mail de recuperacion'}),400,{'ContentType':'application/json'}
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error en la recuperacion de la contraseña'}),400,{'ContentType':'application/json'}

    @app.route("/reset_password", methods=["POST"])
    def resetPassword():
        try:
            id = request.form.get("id", None)
            token = request.form.get("token", None)
            new_password = request.form.get("new_password", None)
            duplicated_new_password = request.form.get("duplicated_new_password", None)


            if id is None or token is None  or token == '':
                return jsonify({'msg':'Faltan datos para realizar la busqueda'}),400,{'ContentType':'application/json'}

            if new_password is None or new_password == '':
                return jsonify({'msg':'La nueva contraseña es obligatoria'}),400,{'ContentType':'application/json'}

            if duplicated_new_password is None or duplicated_new_password == '':
                return jsonify({'msg':'La confirmacion de la nueva contraseña es obligatoria'}),400,{'ContentType':'application/json'}

            if len(new_password) < 8:
                return jsonify({'msg':'La nueva contraseña debe tener al menos 8 caracteres'}),400,{'ContentType':'application/json'}

            #if not any(char.isdigit() for char in new_password):
            #    return jsonify({'msg':'La nueva contraseña debe tener al menos un numero'}),400,{'ContentType':'application/json'}

            #if not any(char.isupper() for char in new_password):
            #    return jsonify({'msg':'La nueva contraseña debe tener al menos una mayuscula'}),400,{'ContentType':'application/json'}

            #if not any(char.islower() for char in new_password):
            #    return jsonify({'msg':'La nueva contraseña debe tener al menos una minuscula'}),400,{'ContentType':'application/json'}

            if new_password != duplicated_new_password:
                return jsonify({'msg':'Las contraseñas no coinciden'}),400,{'ContentType':'application/json'}

            user = UsuarioPadre.comprobarRecuperacion(id, token)
            if user is None:
                return jsonify({'msg':'No fue posible actualizar la contraseña'}),400,{'ContentType':'application/json'}
            UsuarioPadre.updatePassword(id, new_password)

            return jsonify({'msg':'Contraseña actualizada correctamente'}),200,{'ContentType':'application/json'}
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error al actualizar password'}),400,{'ContentType':'application/json'}


    @app.route("/logout", methods=["DELETE"])
    @jwt_required()
    def logout():
        response = jsonify({"msg": "logout successful"})
        unset_jwt_cookies(response)
        return response


    #### LISTADOS =======================================================================================================

    @app.route("/listado/perdidos_y_encontrados", methods=["GET"])
    def listado_perdidos_y_encontrados():
        try:
            geo_lat = request.args.get("geo_lat",0.0)
            geo_long = request.args.get("geo_long",0.0)
            publicaciones = Publicacion.allEnabledPerdidosYEncontradosCerca(geo_lat, geo_long)
            return jsonify({'publicaciones':
                                        [{
                                            "id": each[0].id,
                                            "nombre": each[0].nombre,
                                            "edad": each[0].edad,
                                            "edad_unidad": each[0].edad_unidad,
                                            "edad_aprox": each[0].edad_aprox,
                                            "edad_estimada": each[0].edad_estimada,
                                            "raza_mascota": each[0].raza_mascota.raza,
                                            "raza_mascota_id": each[0].raza_mascota.id,
                                            "tipo_mascota": each[0].tipo_mascota.tipo,
                                            "tipo_mascota_id": each[0].tipo_mascota.id,
                                            "colores": each[0].colores.split(","),
                                            "size": each[0].tamaño,
                                            "sexo": each[0].sexo,
                                            "created_at": each[0].created_at.strftime("%d/%m/%Y"),
                                            "tipo": each[0].tipo,
                                            "geo_lat": each[0].geo_lat,
                                            "geo_long": each[0].geo_long,
                                            "imagen": each[0].imagen_id,
                                            "distancia":round(each[1],2) if round(each[1],2) > 1 else "Menos de 1"
                                        }  for each in publicaciones if each[0].vencimiento is None or each[0].vencimiento > datetime.now()]
                            }),200,{'ContentType':'application/json'}
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error listando perdidos y encontrados'}),400,{'ContentType':'application/json'}

    @app.route("/listado/adopcion_y_transito", methods=["GET"])
    def listado_adopcion_y_transito():
        try:
            geo_lat = request.args.get("geo_lat",0.0)
            geo_long = request.args.get("geo_long",0.0)
            publicaciones = Publicacion.allEnabledAdopcionYTransitoCerca(geo_lat, geo_long)
            return jsonify({'publicaciones':
                                        [{
                                            "id": each[0].id,
                                            "nombre": each[0].nombre,
                                            "edad": each[0].edad,
                                            "edad_unidad": each[0].edad_unidad,
                                            "edad_aprox": each[0].edad_aprox,
                                            "edad_estimada": each[0].edad_estimada,
                                            "raza_mascota": each[0].raza_mascota.raza,
                                            "raza_mascota_id": each[0].raza_mascota.id,
                                            "tipo_mascota": each[0].tipo_mascota.tipo,
                                            "tipo_mascota_id": each[0].tipo_mascota.id,
                                            "colores": each[0].colores.split(","),
                                            "size": each[0].tamaño,
                                            "sexo": each[0].sexo,
                                            "created_at": each[0].created_at.strftime("%d/%m/%Y"),
                                            "tipo": each[0].tipo,
                                            "geo_lat": each[0].geo_lat,
                                            "geo_long": each[0].geo_long,
                                            "imagen": each[0].imagen_id,
                                            "distancia": round(each[1],2) if round(each[1],2) > 1 else "Menos de 1"
                                        }  for each in publicaciones]
                            }),200,{'ContentType':'application/json'}
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error listando perdidos y encontrados'}),400,{'ContentType':'application/json'}


    #### PUBLICACIONES =================================================================================================

    @app.route("/publicacion/mis_publicaciones", methods=["GET"])
    @jwt_required()
    def mis_publicaciones():
        try:
            user:UsuarioPadre = UsuarioPadre.buscarUsuarioPorID(get_jwt_identity()[1])
            return jsonify([p.to_dict() for p in user.publicaciones if p.enabled]),200,{'ContentType':'application/json'}
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error al recuperar el perfil del usuario'}),400,{'ContentType':'application/json'}


    @app.route("/publicacion/nueva/<tipo>", methods=["POST"])
    @jwt_required(optional=True)
    def nuevaPublicacion(tipo):
        try:
            if int(tipo) != 2 and get_jwt_identity() is None:
                return jsonify({'msg':'Debe iniciar sesion primero'}),401,{'ContentType':'application/json'}

            if int(tipo) == 2 or request.form.get("id_mascota",None) is None:
                # llamar metodo validarRequestNuevaPublicacion
                validacion = validarRequestNuevaPublicacion(request,tipo)
                if validacion is not None:
                    return validacion
                print(request.form.get("colores",None))
                publicacion = Publicacion(
                            nombre = request.form.get("nombre",None) if request.form.get("nombre",None).strip().replace(" ","") != "" else "---",
                            edad = request.form.get("edad",None),
                            edad_unidad = request.form.get("edad_unidad",None),
                            edad_aprox = (int(tipo) == 2),
                            edad_estimada = request.form.get("edad_estimada",None) if int(tipo) == 2 else None,
                            colores = request.form.get("colores",None),
                            tamaño = request.form.get("size",None),
                            sexo = request.form.get("sexo",None),
                            caracteristicas = request.form.get("caracteristicas",None),
                            geo_lat = request.form.get("geo_lat",None),
                            geo_long = request.form.get("geo_long",None),
                            tipo = int(tipo),
                            estadoGeneral = 1,
                            castracion = request.form.get("castracion",None) == "true" if int(tipo) in (3,4) else None,
                            vacunacion = request.form.get("vacunacion",None) if int(tipo) in (3,4) else None,
                            patologias = request.form.get("patologias",None) if int(tipo) in (3,4) else None,
                            medicacion = request.form.get("medicacion",None) if int(tipo) in (3,4) else None,
                            duracion_transito = request.form.get("duracion_transito",None) if int(tipo) == 4 else None,
                            tipo_mascota_id = request.form.get("tipo_mascota",None),
                            raza_mascota_id = request.form.get("raza_mascota",None),
                            publicador_id = get_jwt_identity()[1] if get_jwt_identity() is not None else None,
                            mascota_id = None,
                            retuvo = request.form.get("retuvo",None) == "true" if int(tipo) == 2 else None,
                            contacto_anonimo= request.form.get("contacto_anonimo",None) if int(tipo) == 2 and request.form.get("contacto_anonimo",None) != "undefined" and request.form.get("contacto_anonimo",None) != "null" else None,
                        )

                if 'imagen' not in request.files:
                    return jsonify({'msg':'La imagen es obligatoria'}),400,{'ContentType':'application/json'}
                file = request.files.get('imagen')
                if file.filename == '':
                    return jsonify({'msg':'La imagen es obligatoria'}),400,{'ContentType':'application/json'}
                if file and file.content_type.startswith('image'):
                    if file.content_type != 'image/jpeg':
                        return jsonify({'msg':'La imagen ingresada no es JPG'}),400,{'ContentType':'application/json'}
                else:
                    return jsonify({'msg':'El archivo ingresado no es una imagen'}),400,{'ContentType':'application/json'}

                img = resize_and_save_image(request.files.get("imagen").read())
                publicacion.imagen = img if img != False else None

                publicacion.save()
                similares = publicacionesParecidas(publicacion)
                return jsonify({"new":True, "publicacion":publicacion.to_dict(),"cant_similares":len(similares),"similares": similares})

            mascota: Mascota = Mascota.buscarMascotaPorID(request.form.get("id_mascota",None))
            if mascota is None:
                return jsonify({'msg':'Error al generar la publicacion'}),400,{'ContentType':'application/json'}

            years = round((datetime.now() - mascota.fecha_nacimiento).days / 365) if (datetime.now() - mascota.fecha_nacimiento).days % 365 < 183 else round((datetime.now() - mascota.fecha_nacimiento).days / 365) - 1
            if years == 0:
                months = round((datetime.now() - mascota.fecha_nacimiento).days / 30) if (datetime.now() - mascota.fecha_nacimiento).days % 30 < 15 else round((datetime.now() - mascota.fecha_nacimiento).days / 30) - 1
                if months == 1:
                    edad_value = months
                    edad_unit = "mes"
                else:
                    edad_value = months
                    edad_unit = "meses"
            elif years == 1:
                edad_value = years
                edad_unit = "año"
            else:
                edad_value = years
                edad_unit = "años"

            publi_existente: Publicacion = Publicacion.buscarPublicacionActivaPorMascota(mascota.id,int(tipo))
            if publi_existente is None:
                publicacion = Publicacion(mascota.nombre,
                                            edad_value,
                                            edad_unit,
                                            False,
                                            None,
                                            mascota.colores,
                                            mascota.tamaño,
                                            mascota.sexo,
                                            mascota.caracteristicas,
                                            request.form.get("geo_lat",None),
                                            request.form.get("geo_long",None),
                                            int(tipo),
                                            1,
                                            mascota.castracion,
                                            mascota.vacunacion,
                                            mascota.enfermedades,
                                            mascota.medicacion,
                                            request.form.get("duracion_transito",None),
                                            mascota.tipo_mascota_id,
                                            mascota.raza_mascota_id,
                                            publicador_id = get_jwt_identity()[1],
                                            mascota_id = mascota.id,
                                            retuvo= None,
                                            contacto_anonimo= None
                                        )
                publicacion.imagen_id = mascota.imagen_id
                publicacion.save()
                if int(tipo) == 1:
                    mascota.perdido = True
                    mascota.save()
                similares = publicacionesParecidas(publicacion)
                return jsonify({"new":True, "publicacion":publicacion.to_dict(),"cant_similares":len(similares),"similares": similares})
            else:
                publi_existente.created_at = datetime.now()
                publi_existente.save()
                similares = publicacionesParecidas(publi_existente)
                return jsonify({"new":False,"publicacion": publi_existente.to_dict(),"cant_similares":len(similares),"similares": similares})
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error creando la publicacion'}),400,{'ContentType':'application/json'}

    def publicacionesParecidas(publicacion: Publicacion):
        if (publicacion.tipo == 3 or publicacion.tipo == 4):
            return []
        publis = Publicacion.allEnabledEnRango(publicacion.geo_lat, publicacion.geo_long, 10,[2,1][publicacion.tipo - 1])

        publis_1er_filtro = [ p
                              for p in publis
                              if p[0].tipo_mascota_id == publicacion.tipo_mascota_id and
                                 p[0].sexo == publicacion.sexo and
                                 ((round((datetime.now() - p[0].created_at).total_seconds())/3600 < 48) if publicacion.tipo == 1 else True) and
                                 p[0].id != publicacion.id
                            ]

        publis_con_coincidencia = []

        for p in publis_1er_filtro:
            coincidencia = 0.0

            #Comparacion de Edad
            if publicacion.tipo==2:
                if publicacion.edad_estimada == "Menos de 1 año":
                    rango = [0,0.9999999]
                elif publicacion.edad_estimada == "1 a 3 años":
                    rango = [1,3]
                elif publicacion.edad_estimada == "4 a 6 años":
                    rango = [4,6]
                elif publicacion.edad_estimada == "7 a 9 años":
                    rango = [7,9]
                elif publicacion.edad_estimada == "Más de 10 años":
                    rango = [10,9999999]

                if p[0].edad_unidad == "meses" and rango[1] < 1:
                    coincidencia = coincidencia + 15.0
                else:
                    if p[0].edad >= rango[0] and p[0].edad <= rango[1]:
                        coincidencia = coincidencia + 15.0
            else:
                if p[0].edad_estimada == "Menos de 1 año":
                    rango = [0,0.9999999]
                elif p[0].edad_estimada == "1 a 3 años":
                    rango = [1,3]
                elif p[0].edad_estimada == "4 a 6 años":
                    rango = [1,3]
                elif p[0].edad_estimada == "7 a 9 años":
                    rango = [1,3]
                elif p[0].edad_estimada == "Más de 10 años":
                    rango = [10,9999999]

                if publicacion.edad_unidad == "meses" and rango[1] < 1:
                    coincidencia = coincidencia + 15.0
                else:
                    if publicacion.edad >= rango[0] and publicacion.edad <= rango[1]:
                        coincidencia = coincidencia + 15.0

            #Comparacion de Nombre
            if p[0].nombre != "---" and publicacion.nombre != "---":
                if p[0].nombre.upper().strip().replace(" ","") == publicacion.nombre.upper().strip().replace(" ",""):
                    coincidencia = coincidencia + 15.0

            #Comparacion de Tamaño
            if p[0].tamaño == publicacion.tamaño:
                coincidencia = coincidencia + 15.0

            #Comparacion de Raza
            if p[0].raza_mascota_id == publicacion.raza_mascota_id:
                coincidencia = coincidencia + 15.0

            #Comparacion de GeoUbicacion
            if p[1] <= 2.5:
                coincidencia = coincidencia + 20.0
            elif p[1] > 2.5 and p[1] <= 5:
                coincidencia = coincidencia + 15.0
            elif p[1] > 5 and p[1] <= 7.5:
                coincidencia = coincidencia + 10.0
            elif p[1] > 7.5 and p[1] <= 10:
                coincidencia = coincidencia + 5.0
            else:
                coincidencia = coincidencia + 0.0

            #Comparacion de Colores
            for each in publicacion.colores.split(", "):
                if each in p[0].colores.split(", "):
                    coincidencia = coincidencia + (20 / len(publicacion.colores.split(", ")))
            p_dic= p[0].dict_similares()
            p_dic["distancia"] = round(p[1],1)
            p_dic["coincidencia"] = round(coincidencia,1)

            publis_con_coincidencia.append(p_dic)

        publis_coincidencia_seleccionadas = [ p for p in publis_con_coincidencia if p["coincidencia"] > 50 ]

        publis_coincidencia_seleccionadas.sort(key= lambda p: (-p["coincidencia"], p["distancia"]))

        return publis_coincidencia_seleccionadas[:10]


    @app.route("/publicacion/detalle/<id>", methods=["GET"])
    @jwt_required(optional=True)
    def detallePublicacion(id):
        try:
            publicacion:Publicacion = Publicacion.buscarPublicacionPorID(id)

            if publicacion is None:
                return jsonify({"msg":"Publicacion con id {} inexistente".format(id)}),205,{'ContentType':'application/json'}

            if not publicacion.enabled:
                return jsonify({"msg":"Publicacion con id {} inexistente".format(id)}),205,{'ContentType':'application/json'}

            if publicacion.estadoGeneral == 2:
                if get_jwt_identity() is None or get_jwt_identity()[1] != publicacion.publicador_id:
                    return jsonify({"msg":"Publicacion con id {} inexistente".format(id)}),205,{'ContentType':'application/json'}

            if publicacion.vencimiento is not None and publicacion.vencimiento < datetime.now():
                if get_jwt_identity() is None or get_jwt_identity()[1] != publicacion.publicador_id:
                    return jsonify({"msg":"Publicacion con id {} inexistente".format(id)}),205,{'ContentType':'application/json'}

            return publicacion.to_dict()
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error al obtener el detalle la publicacion'}),400,{'ContentType':'application/json'}

    @app.route("/publicacion/editar/<id>", methods=["POST"])
    @jwt_required()
    def editarPublicacion(id):
        try:
            publicacion:Publicacion = Publicacion.buscarPublicacionPorID(id)
            if publicacion is None:
                return jsonify({'msg':'No existe una publicacion con id {} en el sistema'.format(id)}),400,{'ContentType':'application/json'}
            if publicacion.vencimiento is not None and publicacion.vencimiento < datetime.now():
                return jsonify({'msg':'La publicacion con id {} se encuentra vencida'.format(id)}),400,{'ContentType':'application/json'}
            elif publicacion.publicador_id != get_jwt_identity()[1]:
                return jsonify({'msg':'El usuario iniciado no tiene permiso para acceder a editar la publicacion {}'.format(id)}),401,{'ContentType':'application/json'}

            if request.form.get("id_mascota",None) is not None:
                if int(request.form.get("id_mascota",None)) != publicacion.mascota_id:
                    mascota: Mascota = Mascota.buscarMascotaPorID(request.form.get("id_mascota",None))
                    if mascota is None:
                        return jsonify({'msg':'Error al actualizar la publicacion'}),400,{'ContentType':'application/json'}

                    years = round((datetime.now() - mascota.fecha_nacimiento).days / 365) if (datetime.now() - mascota.fecha_nacimiento).days % 365 < 183 else round((datetime.now() - mascota.fecha_nacimiento).days / 365) - 1
                    if years == 0:
                        months = round((datetime.now() - mascota.fecha_nacimiento).days / 30) if (datetime.now() - mascota.fecha_nacimiento).days % 30 < 15 else round((datetime.now() - mascota.fecha_nacimiento).days / 30) - 1
                        if months == 1:
                            edad_value = months
                            edad_unit = "mes"
                        else:
                            edad_value = months
                            edad_unit = "meses"
                    elif years == 1:
                        edad_value = years
                        edad_unit = "año"
                    else:
                        edad_value = years
                        edad_unit = "años"
                    print("mascota")
                    print(request.form.get("geo_lat",None))
                    publicacion.nombre = mascota.nombre
                    publicacion.edad = edad_value
                    publicacion.edad_unidad = edad_unit,
                    publicacion.edad_aprox = False
                    publicacion.edad_estimada = None,
                    publicacion.colores = mascota.colores
                    publicacion.tamaño = mascota.tamaño
                    publicacion.sexo = mascota.sexo
                    publicacion.caracteristicas = mascota.caracteristicas
                    publicacion.geo_lat = request.form.get("geo_lat",None)
                    publicacion.geo_long = request.form.get("geo_long",None)
                    publicacion.castracion = mascota.castracion
                    publicacion.vacunacion = mascota.vacunacion
                    publicacion.patologias = mascota.enfermedades
                    publicacion.medicacion = mascota.medicacion
                    publicacion.duracion_transito = request.form.get("duracion_transito",None)
                    publicacion.tipo_mascota_id = mascota.tipo_mascota_id
                    publicacion.raza_mascota_id = mascota.raza_mascota_id
                    publicacion.imagen_id = mascota.imagen_id
                    publicacion.mascota_id = mascota.id
                    publicacion.save()
                else :
                    if (publicacion.geo_lat != request.form.get("geo_lat") or publicacion.geo_long != request.form.get("geo_long")):
                        publicacion.geo_lat = request.form.get("geo_lat")
                        publicacion.geo_long = request.form.get("geo_long")
                        publicacion.save()

            else:
                validacion = validarRequestNuevaPublicacion(request,publicacion.tipo)
                if validacion is not None:
                    return validacion
                publicacion.nombre = request.form.get("nombre",None) if request.form.get("nombre",None).strip().replace(" ","") != "" else "---"
                if (publicacion.tipo != 2):
                    publicacion.edad = request.form.get("edad",None)
                    publicacion.edad_unidad = request.form.get("edad_unidad",None)
                else:
                    publicacion.edad_estimada = request.form.get("edad_estimada",None)
                    publicacion.retuvo = request.form.get("retuvo",None) == "true"
                    publicacion.contacto_anonimo= request.form.get("contacto_anonimo",None) if request.form.get("contacto_anonimo",None) != "undefined" and request.form.get("contacto_anonimo",None) != "null" else None
                print(request.form.get("colores",None))
                publicacion.colores = request.form.get("colores",None)
                publicacion.tamaño = request.form.get("size",None)
                publicacion.sexo = request.form.get("sexo",None)
                publicacion.caracteristicas = request.form.get("caracteristicas",None) if request.form.get("caracteristicas",None) != "undefined" and request.form.get("caracteristicas",None) != "null" else None
                publicacion.geo_lat = request.form.get("geo_lat",None)
                publicacion.geo_long = request.form.get("geo_long",None)
                if publicacion.tipo in (3,4):
                    publicacion.castracion = request.form.get("castracion",None) == "true"
                    publicacion.vacunacion = request.form.get("vacunacion",None) if publicacion.tipo in (3,4) else None

                    if request.form.get("patologias",None) != "undefined" and request.form.get("patologias",None) != "null":
                        publicacion.patologias = request.form.get("patologias",None)
                    if request.form.get("medicacion",None) != "undefined" and request.form.get("medicacion",None) != "null":
                        publicacion.medicacion = request.form.get("medicacion",None)

                    if publicacion.tipo == 4:
                        publicacion.duracion_transito = request.form.get("duracion_transito",None)

                publicacion.tipo_mascota_id = request.form.get("tipo_mascota",None)
                publicacion.raza_mascota_id = request.form.get("raza_mascota",None)
                publicacion.mascota_id = None

                if 'imagen' in request.files:
                    file = request.files.get('imagen')

                    if file and file.content_type.startswith('image'):
                        if file.content_type != 'image/jpeg':
                            return jsonify({'msg':'La imagen ingresada no es JPG'}),400,{'ContentType':'application/json'}
                    else:
                        return jsonify({'msg':'El archivo ingresado no es una imagen'}),400,{'ContentType':'application/json'}

                    img = resize_and_save_image(request.files.get("imagen").read())
                    publicacion.imagen = img if img != False else None

                publicacion.save()
            return publicacion.to_dict()
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error al editar la publicacion'}),400,{'ContentType':'application/json'}

    @app.route("/publicacion/eliminar/<id>", methods=["DELETE"])
    @jwt_required()
    def eliminarPublicacion(id):
        try:
            publicacion:Publicacion = Publicacion.buscarPublicacionPorID(id)
            if publicacion is None or not publicacion.enabled:
                return jsonify({'msg':'No existe una publicacion con id {} en el sistema'.format(id)}),400,{'ContentType':'application/json'}
            elif publicacion.publicador_id != get_jwt_identity()[1]:
                return jsonify({'msg':'El usuario iniciado no tiene permiso para acceder a editar la publicacion {}'.format(id)}),401,{'ContentType':'application/json'}

            if publicacion.mascota_id is not None and publicacion.tipo == 1:
                mascota: Mascota = Mascota.buscarMascotaPorID(publicacion.mascota_id)
                mascota.perdido = False
                mascota.save()

            if publicacion.eliminar():
                return jsonify({'msg':'Publicacion eliminada con exito'}),200,{'ContentType':'application/json'}
            return jsonify({'msg':'Ocurrio un error al eliminar la publicacion'}),400,{'ContentType':'application/json'}
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error al eliminar la publicacion'}),400,{'ContentType':'application/json'}

    @app.route("/publicacion/pausar/<id>", methods=["POST"])
    @jwt_required()
    def pausarPublicacion(id):
        try:
            publicacion:Publicacion = Publicacion.buscarPublicacionPorID(id)
            if publicacion is None or not publicacion.enabled:
                return jsonify({'msg':'No existe una publicacion con id {} en el sistema'.format(id)}),400,{'ContentType':'application/json'}
            elif publicacion.vencimiento is not None and publicacion.vencimiento < datetime.now():
                return jsonify({'msg':'La publicacion con id {} se encuentra vencida'.format(id)}),400,{'ContentType':'application/json'}
            elif publicacion.publicador_id != get_jwt_identity()[1]:
                return jsonify({'msg':'El usuario iniciado no tiene permiso para acceder a pausar la publicacion {}'.format(id)}),401,{'ContentType':'application/json'}
            elif publicacion.estadoGeneral != 1:
                return jsonify({'msg':'Solo puede pausarse una publicacion que se encuentre activa'}),401,{'ContentType':'application/json'}

            publicacion.estadoGeneral = 2
            publicacion.updated_at = datetime.now()
            publicacion.save()

            return jsonify({'msg':'Publicacion pausada con exito'}),200,{'ContentType':'application/json'}

        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error al pausar la publicacion'}),400,{'ContentType':'application/json'}

    @app.route("/publicacion/reanudar/<id>", methods=["POST"])
    @jwt_required()
    def reanudarPublicacion(id):
        try:
            publicacion:Publicacion = Publicacion.buscarPublicacionPorID(id)
            if publicacion is None or not publicacion.enabled:
                return jsonify({'msg':'No existe una publicacion con id {} en el sistema'.format(id)}),400,{'ContentType':'application/json'}
            elif publicacion.vencimiento is not None and publicacion.vencimiento < datetime.now():
                return jsonify({'msg':'La publicacion con id {} se encuentra vencida'.format(id)}),400,{'ContentType':'application/json'}
            elif publicacion.publicador_id != get_jwt_identity()[1]:
                return jsonify({'msg':'El usuario iniciado no tiene permiso para acceder a reanudar la publicacion {}'.format(id)}),401,{'ContentType':'application/json'}
            elif publicacion.estadoGeneral != 2:
                return jsonify({'msg':'Solo puede reanudarse una publicacion que se encuentre pausada'}),401,{'ContentType':'application/json'}
            publicacion.estadoGeneral = 1
            publicacion.updated_at = datetime.now()
            publicacion.save()

            return jsonify({'msg':'Publicacion reanudada con exito'}),200,{'ContentType':'application/json'}

        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error al reanudada la publicacion'}),400,{'ContentType':'application/json'}

    @app.route("/publicacion/finalizar/<id>", methods=["POST"])
    @jwt_required()
    def finalizarPublicacion(id):
        try:
            publicacion:Publicacion = Publicacion.buscarPublicacionPorID(id)
            if publicacion is None or not publicacion.enabled:
                return jsonify({'msg':'No existe una publicacion con id {} en el sistema'.format(id)}),400,{'ContentType':'application/json'}
            elif publicacion.vencimiento is not None and publicacion.vencimiento < datetime.now():
                return jsonify({'msg':'La publicacion con id {} se encuentra vencida'.format(id)}),400,{'ContentType':'application/json'}
            elif publicacion.publicador_id != get_jwt_identity()[1]:
                return jsonify({'msg':'El usuario iniciado no tiene permiso para acceder a finalizar la publicacion {}'.format(id)}),401,{'ContentType':'application/json'}
            elif publicacion.estadoGeneral != 1:
                return jsonify({'msg':'Solo puede finalizarse una publicacion que se encuentre activa'}),401,{'ContentType':'application/json'}

            publicacion.estadoGeneral = 3
            publicacion.updated_at = datetime.now()
            publicacion.save()

            if publicacion.mascota_id is not None and publicacion.tipo == 1:
                mascota: Mascota = Mascota.buscarMascotaPorID(publicacion.mascota_id)
                mascota.perdido = False
                mascota.save()


            return jsonify({'msg':'Publicacion finalizada con exito'}),200,{'ContentType':'application/json'}

        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error al finalizada la publicacion'}),400,{'ContentType':'application/json'}

    #### MAPA =================================================================================================

    # Recibir por query params lat y long y devolver las publicaciones cercanas
    @app.route("/listado/mapa", methods=["GET"])
    def listado_mapa():
        try:
            lat = request.args.get("lat", None)
            long = request.args.get("long", None)
            if lat is None or long is None:
                return jsonify({'msg':'Faltan datos para realizar la busqueda'}),400,{'ContentType':'application/json'}
            publicaciones = Publicacion.allEnabledCercano(lat,long)
            return jsonify({'publicaciones':
                                        [{
                                            "id": each[0].id,
                                            "nombre": each[0].nombre,
                                            "edad": each[0].edad,
                                            "edad_unidad": each[0].edad_unidad,
                                            "edad_aprox": each[0].edad_aprox,
                                            "edad_estimada": each[0].edad_estimada,
                                            "raza_mascota": each[0].raza_mascota.raza,
                                            "raza_mascota_id": each[0].raza_mascota.id,
                                            "tipo_mascota": each[0].tipo_mascota.tipo,
                                            "tipo_mascota_id": each[0].tipo_mascota.id,
                                            "colores": each[0].colores.split(","),
                                            "size": each[0].tamaño,
                                            "sexo": each[0].sexo,
                                            "created_at": each[0].created_at.strftime("%d/%m/%Y"),
                                            "tipo": each[0].tipo,
                                            "geo_lat": each[0].geo_lat,
                                            "geo_long": each[0].geo_long,
                                            "imagen": each[0].imagen_id,
                                            "distancia": round(each[1],2) if round(each[1],2) > 1 else "Menos de 1"
                                        }  for each in publicaciones if each[0].vencimiento is None or each[0].vencimiento > datetime.now()]
                            }),200,{'ContentType':'application/json'}
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error listando perdidos y encontrados'}),400,{'ContentType':'application/json'}


    #### PERFILES =================================================================================================

    @app.route("/listado/organizaciones", methods=["GET"])
    def listado_organizaciones():
        try:
            geo_lat = request.args.get("geo_lat",0.0)
            geo_long = request.args.get("geo_long",0.0)

            organizaciones = Organizacion.allEnabledCerca(geo_lat, geo_long)
            return jsonify({'organizaciones':
                                        [{
                                            "id": each.padre_id,
                                            "nombre": each.nombre,
                                            "geo_lat": each.geo_lat,
                                            "geo_long": each.geo_long,
                                            "imagen": each.padre.imagen_id,
                                            "es_organizacion": True,
                                            "cant_publicaciones": {
                                                "1": len(list(filter(lambda p: p.tipo==1 and p.enabled and p.estadoGeneral==1,each.padre.publicaciones))),
                                                "2": len(list(filter(lambda p: p.tipo==2 and p.enabled and p.estadoGeneral==1,each.padre.publicaciones))),
                                                "3": len(list(filter(lambda p: p.tipo==3 and p.enabled and p.estadoGeneral==1,each.padre.publicaciones))),
                                                "4": len(list(filter(lambda p: p.tipo==4 and p.enabled and p.estadoGeneral==1,each.padre.publicaciones))),
                                            },
                                            "distancia":round(each.distancia,2) if round(each.distancia,2) > 1 else "Menos de 1"
                                        }  for each in organizaciones]
                            }),200,{'ContentType':'application/json'}
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error listando organizaciones'}),400,{'ContentType':'application/json'}

    @app.route("/profile/<id>", methods=["GET"])
    def perfil(id):
        try:
            usuario: UsuarioPadre = UsuarioPadre.buscarUsuarioPorID(id)
            if usuario is not None:
                return jsonify(usuario.complete_dict_filtrado()),200,{'ContentType':'application/json'}

            return jsonify({'msg':'No se encontro el usuario'}),404,{'ContentType':'application/json'}
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error al recuperar el perfil del usuario'}),400,{'ContentType':'application/json'}

    @app.route("/perfil/mi_perfil", methods=["GET"])
    @jwt_required()
    def mi_perfil():
        try:
            usuario:UsuarioPadre = UsuarioPadre.buscarUsuarioPorID(get_jwt_identity()[1])
            return jsonify(usuario.complete_dict()),200,{'ContentType':'application/json'}
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error al recuperar el perfil del usuario'}),400,{'ContentType':'application/json'}

    @app.route("/perfil/actualizar_password", methods=["POST"])
    @jwt_required()
    def actualizarPassword():
        try:
            if request.form.get("actual_password") is None or request.form.get("new_password") is None or request.form.get("actual_password") == '' or request.form.get("new_password") == '':
                return jsonify({'msg':'Faltan datos para realizar la busqueda'}),400,{'ContentType':'application/json'}

            if len(request.form.get("new_password")) < 8:
                return jsonify({'msg':'La nueva contraseña debe tener al menos 8 caracteres'}),400,{'ContentType':'application/json'}

            #if not any(char.isdigit() for char in request.form.get("new_password")):
            #    return jsonify({'msg':'La nueva contraseña debe tener al menos un numero'}),400,{'ContentType':'application/json'}

            #if not any(char.isupper() for char in request.form.get("new_password")):
            #    return jsonify({'msg':'La nueva contraseña debe tener al menos una mayuscula'}),400,{'ContentType':'application/json'}

            #if not any(char.islower() for char in request.form.get("new_password")):
            #    return jsonify({'msg':'La nueva contraseña debe tener al menos una minuscula'}),400,{'ContentType':'application/json'}

            if request.form.get("new_password") != request.form.get("duplicated_new_password"):
                return jsonify({'msg':'Las contraseñas no coinciden'}),400,{'ContentType':'application/json'}

            if (UsuarioPadre.comprobarContraseña(get_jwt_identity()[1], request.form.get("actual_password"))):
                if request.form.get("actual_password") == request.form.get("new_password"):
                    return jsonify({'msg':'La nueva contraseña debe ser diferente a la actual'}),400,{'ContentType':'application/json'}
                UsuarioPadre.updatePassword(get_jwt_identity()[1], request.form.get("new_password"))
            else :
                return jsonify({'msg':'La contraseña actual es incorrecta'}),400,{'ContentType':'application/json'}
            return jsonify({'msg':'Contraseña actualizada correctamente'}),200,{'ContentType':'application/json'}
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error al actualizar password'}),400,{'ContentType':'application/json'}

    @app.route("/perfil/editar", methods=["POST"])
    @jwt_required()
    def editarPerfil():
        try:
            #if get_jwt_identity()[1] != int(id):
            #    return jsonify({'msg':'El usuario iniciado no tiene acceso a editar el perfil {}'.format(id)}),400,{'ContentType':'application/json'}

            if request.form.get('es_organizacion') == 'true':
                organizacion = Organizacion.buscarOrganizacionPorIDPadre(get_jwt_identity()[1])
                if organizacion is not None:
                    return editarPerfilOrganizacion(organizacion, request)
            else:
                usuario = Usuario.buscarUsuarioPorIDPadre(get_jwt_identity()[1])
                if usuario is not None:
                    return editarPerfilUsuario(usuario, request)

            return jsonify({'msg':'Ocurrio un error, no se pudo encontrar al usuario'}),400,{'ContentType':'application/json'}
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error al editar el perfil'}),400,{'ContentType':'application/json'}

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

    def editarPerfilUsuario(usuario, request):
        if usuario is None:
            return jsonify({'msg':'El usuario {} no existe en el sistema'.format(id)}),400,{'ContentType':'application/json'}

        if request.form.get("nombre") is None or request.form.get("nombre") == '':
            return jsonify({'msg':'El nombre es un campo requerido'}),400,{'ContentType':'application/json'}

        if request.form.get("apellido") is None or request.form.get("apellido") == '':
            return jsonify({'msg':'El apellido es un campo requerido'}),400,{'ContentType':'application/json'}

        if request.form.get("fecha_nacimiento") is None or request.form.get("fecha_nacimiento") == '':
            return jsonify({'msg':'La fecha de nacimiento es un campo requerido'}),400,{'ContentType':'application/json'}

        usuario.nombre =  getOrDefault(request,"nombre",usuario.nombre)
        usuario.apellido =  getOrDefault(request,"apellido",usuario.apellido)
        usuario.fecha_nacimiento =  getDateOrDefault(request,"fecha_nacimiento",usuario.fecha_nacimiento)
        usuario.padre.telefono =  getOrDefault(request,"telefono",None)
        usuario.padre.instagram =  getOrDefault(request,"instagram",None)
        usuario.padre.instagram_visible = getBooleanOrDefault(request,"instagram_visible",usuario.padre.instagram_visible)
        if usuario.padre.instagram_visible and usuario.padre.instagram is None:
            usuario.padre.instagram_visible = False
        usuario.padre.email_visible =  getBooleanOrDefault(request,"email_visible",usuario.padre.email_visible)
        usuario.padre.telefono_visible =  getBooleanOrDefault(request,"telefono_visible",usuario.padre.telefono_visible)
        if usuario.padre.telefono_visible and usuario.padre.telefono is None:
            usuario.padre.telefono_visible = False

        if 'imagen' in request.files:
            file = request.files.get('imagen')
            if file and file.content_type.startswith('image'):
                if file.content_type != 'image/jpeg':
                    return jsonify({'msg':'La imagen ingresada no es JPG'}),400,{'ContentType':'application/json'}
            else:
                return jsonify({'msg':'El archivo ingresado no es una imagen'}),400,{'ContentType':'application/json'}

            img = resize_and_save_image(request.files.get("imagen").read())
            usuario.padre.imagen = img if img != False else None

        usuario.save()
        return usuario.to_dict()

    def editarPerfilOrganizacion(organizacion, request):
        if organizacion is None:
            return jsonify({'msg':'La organizacion {} no existe en el sistema'.format(id)}),400,{'ContentType':'application/json'}

        if (request.form.get("nombre") is None or request.form.get("nombre") == ''):
            return jsonify({'msg':'El nombre es un campo requerido'}),400,{'ContentType':'application/json'}

        if (request.form.get("geo_lat") is None or request.form.get("geo_lat") == '' or request.form.get("geo_long") is None or request.form.get("geo_long") == ''):
            return jsonify({'msg':'La ubicacion es requerida'}),400,{'ContentType':'application/json'}

        if (request.form.get("descripcion_breve") is None or request.form.get("descripcion_breve") == ''):
            return jsonify({'msg':'La descripcion breve es un campo requerido'}),400,{'ContentType':'application/json'}

        if (request.form.get("dni_responsable") is None or request.form.get("dni_responsable") == ''):
            return jsonify({'msg':'El dni del responsable es un campo requerido'}),400,{'ContentType':'application/json'}

        if (request.form.get("nombre_responsable") is None or request.form.get("nombre_responsable") == ''):
            return jsonify({'msg':'El nombre del responsable es un campo requerido'}),400,{'ContentType':'application/json'}

        if (request.form.get("apellido_responsable") is None or request.form.get("apellido_responsable") == ''):
            return jsonify({'msg':'El apellido del responsable es un campo requerido'}),400,{'ContentType':'application/json'}


        organizacion.nombre = getOrDefault(request,"nombre",organizacion.nombre)
        organizacion.geo_lat = getOrDefault(request,"geo_lat",organizacion.geo_lat)
        organizacion.geo_long = getOrDefault(request,"geo_long",organizacion.geo_long)
        organizacion.descripcion_breve = getOrDefault(request,"descripcion_breve",organizacion.descripcion_breve)
        organizacion.link_donacion = getOrDefault(request,"link_donacion",None)
        organizacion.dni_responsable = getOrDefault(request,"dni_responsable",None)
        organizacion.nombre_responsable = getOrDefault(request,"nombre_responsable",organizacion.nombre_responsable)
        organizacion.apellido_responsable = getOrDefault(request,"apellido_responsable",organizacion.apellido_responsable)
        organizacion.fecha_creacion = getDateOrDefault(request,"fecha_creacion",organizacion.fecha_creacion)

        organizacion.padre.telefono =  getOrDefault(request,"telefono",None)
        organizacion.padre.telefono_visible =  getBooleanOrDefault(request,"telefono_visible",organizacion.padre.telefono_visible)
        if organizacion.padre.telefono is None or organizacion.padre.telefono == '':
            organizacion.padre.telefono_visible = False
        organizacion.padre.instagram =  getOrDefault(request,"instagram",None)
        organizacion.padre.instagram_visible = getBooleanOrDefault(request,"instagram_visible",organizacion.padre.instagram_visible)

        if organizacion.padre.instagram is None or organizacion.padre.instagram == '':
            organizacion.padre.instagram_visible = False
        organizacion.padre.email_visible =  getBooleanOrDefault(request,"email_visible",organizacion.padre.email_visible)

        if 'imagen' in request.files:
            file = request.files.get('imagen')
            if file and file.content_type.startswith('image'):
                if file.content_type != 'image/jpeg':
                    return jsonify({'msg':'La imagen ingresada no es JPG'}),400,{'ContentType':'application/json'}
            else:
                return jsonify({'msg':'El archivo ingresado no es una imagen'}),400,{'ContentType':'application/json'}

            img = resize_and_save_image(request.files.get("imagen").read())
            organizacion.padre.imagen = img if img != False else None

        organizacion.save()
        return organizacion.to_dict()

    @app.route("/perfil/busqueda/<info>", methods=["GET"])
    def busquedaPerfil(info:str):

        if len(info.strip().replace(" ","")) < 2:
            # return jsonify({"msg":"Ingrese al menos 2 caracteres para buscar"}),400,{'ContentType':'application/json'}
            return jsonify({"resultados": []}),200,{'ContentType':'application/json'}

        usuarios = Usuario.buscarSimilitud(info.strip().replace(" ",""))
        organizaciones = Organizacion.buscarSimilitud(info.strip().replace(" ",""))

        similitudes = []

        similitudes += usuarios if usuarios is not None else []
        similitudes += organizaciones if organizaciones is not None else []

        return jsonify({"resultados": similitudes[0:15] if len(similitudes)>0 else similitudes}),200,{'ContentType':'application/json'}


    #### MASCOTAS =================================================================================================

    @app.route("/mascota/nueva", methods=["POST"])
    @jwt_required()
    def nuevaMascota():
        try:
            if request.form.get("nombre",None) is None or request.form.get("nombre",None) == "null" and request.form.get("nombre",None) == "undefined":
                return jsonify({'msg':'Debe completar todos los campos'}),400,{'ContentType':'application/json'}


            mascota = Mascota(
                                request.form.get("nombre"),
                                datetime(   int(request.form.get("fecha_nacimiento").split("-")[0]),
                                            int(request.form.get("fecha_nacimiento").split("-")[1]),
                                            int(request.form.get("fecha_nacimiento").split("-")[2])),
                                request.form.get("colores"),
                                request.form.get("size"),
                                request.form.get("sexo"),
                                request.form.get("caracteristicas") if request.form.get("nombre",None) is not None and request.form.get("nombre",None) != "null" and request.form.get("nombre",None) != "undefined" else None,
                                request.form.get("castracion") == "true",
                                request.form.get("vacunacion"),
                                request.form.get("enfermedades") if request.form.get("enfermedades",None) is not None and request.form.get("enfermedades",None) != "null" and request.form.get("enfermedades",None) != "undefined" else None,
                                request.form.get("cirugias") if request.form.get("cirugias",None) is not None and request.form.get("cirugias",None) != "null" and request.form.get("cirugias",None) != "undefined" else None,
                                request.form.get("medicacion") if request.form.get("medicacion",None) is not None and request.form.get("medicacion",None) != "null" and request.form.get("medicacion",None) != "undefined" else None,
                                request.form.get("tipo_mascota"),
                                request.form.get("raza_mascota"),
                            )

            if 'imagen' not in request.files:
                return jsonify({'msg':'El request no tenia una imagen'}),400,{'ContentType':'application/json'}
            file = request.files.get('imagen')
            if file.filename == '':
                return jsonify({'msg':'El request no tenia una imagen'}),400,{'ContentType':'application/json'}
            if file and file.content_type.startswith('image'):
                if file.content_type != 'image/jpeg':
                    return jsonify({'msg':'La imagen ingresada no es JPG'}),400,{'ContentType':'application/json'}
            else:
                return jsonify({'msg':'El archivo ingresado no es una imagen'}),400,{'ContentType':'application/json'}

            img = resize_and_save_image(request.files.get("imagen").read())
            mascota.imagen = img if img != False else None

            user = UsuarioPadre.buscarUsuarioPorID(get_jwt_identity()[1])
            user.mascotas.append(mascota)
            user.save()
            return mascota.to_dict()
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error al obtener crear una nueva mascota'}),400,{'ContentType':'application/json'}

    @app.route("/mascota/detalle/<id>", methods=["GET"])
    @jwt_required()
    def detalleMascota(id):
        try:
            mascota:Mascota = Mascota.buscarMascotaPorID(id)
            if mascota is None or not mascota.enabled:
                return jsonify({'msg':'La mascota no existe u ocurrio un error recuperando su informacion'}),400,{'ContentType':'application/json'}
            elif UsuarioPadre.buscarUsuarioPorID(get_jwt_identity()[1]) not in mascota.dueños:
                return jsonify({'msg':'El usuario iniciado no tiene permisos de ver esta mascota, solo sus dueños'}),400,{'ContentType':'application/json'}
            return mascota.to_dict()
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error al obtener el detalle la mascota'}),400,{'ContentType':'application/json'}


    @app.route("/mascota/perfil/<id>", methods=["GET"])
    def perfilMascotaQR(id):
        mascota: Mascota = Mascota.buscarMascotaPorID(id)
        if mascota is None:
            return jsonify({'msg':'La mascota no existe u ocurrio un error recuperando su informacion'}),400,{'ContentType':'application/json'}

        return render_template("perfil_mascota.html", mascota= mascota.to_dict(), contactos = mascota.get_contactos())

    @app.route("/mascota/detalle/<id>/qr", methods=["GET"])
    def detalleMascotaQRTemplate(id):
        jwt = request.args.get("jwt","")
        mascota: Mascota = Mascota.buscarMascotaPorID(id)
        if mascota is None:
            return jsonify({'msg':'La mascota no existe u ocurrio un error recuperando su informacion'}),400,{'ContentType':'application/json'}

        return render_template("qr_download.html",direc="/mascota/detalle/{}/qr/obtener?jwt={}".format(id,jwt))

    @app.route("/mascota/detalle/<id>/qr/obtener", methods=["GET"])
    # @jwt_required()
    def detalleMascotaQR(id):
        try:
            mascota: Mascota = Mascota.buscarMascotaPorID(id)
            if mascota is None:
                return jsonify({'msg':'La mascota no existe u ocurrio un error recuperando su informacion'}),400,{'ContentType':'application/json'}

            import qrcode
            import io
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_H,
                box_size=20,
                border=1,
            )
            qr.add_data("https://betaapp.pythonanywhere.com/mascota/perfil/{}".format(id))
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")

            width, height = img.size
            aspect_ratio = width / height
            new_width, new_height = (width, height)
            if width > height:
                new_width = 115
                new_height = int(new_width / aspect_ratio)
            else:
                new_height = 115
                new_width = int(new_height * aspect_ratio)

            resized_image = img.resize((new_width, new_height))


        
            mascota:Mascota = Mascota.buscarMascotaPorID(id)

            # Convertimos la imagen a formato JPEG
            with io.BytesIO() as buffer:
                resized_image.save(buffer, format="JPEG")
                buffer.seek(0)
                return Response(buffer.read(), mimetype='image/jpeg', headers={"Content-Disposition":"attachment;filename=QR-Informacion-{}.jpeg".format(mascota.nombre)})
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error al obtener el qr del detalle la mascota'}),400,{'ContentType':'application/json'}

    @app.route("/mascota/mis_mascotas", methods=["GET"])
    @jwt_required()
    def misMascotas():
        user = UsuarioPadre.buscarUsuarioPorID(get_jwt_identity()[1])
        return jsonify([m.to_dict() for m in user.mascotas if m.enabled]),200,{'ContentType':'application/json'}

    @app.route("/mascota/editar/<id>", methods=["POST"])
    @jwt_required()
    def editarMascota(id):
        try:
            mascota:Mascota = Mascota.buscarMascotaPorID(id)
            if mascota is None:
                return jsonify({'msg':'No existe una mascota con id {} en el sistema'.format(id)}),400,{'ContentType':'application/json'}
            elif UsuarioPadre.buscarUsuarioPorID(get_jwt_identity()[1]) not in mascota.dueños:
                return jsonify({'msg':'El usuario iniciado no tiene permiso para acceder a editar la mascota {}'.format(id)}),401,{'ContentType':'application/json'}

            validacion = validarRequestMascota(request)
            if validacion is not None:
                return validacion

            mascota.nombre = request.form.get("nombre",None)
            mascota.colores = request.form.get("colores",None)
            mascota.tamaño = request.form.get("size",None)
            mascota.sexo = request.form.get("sexo",None)
            mascota.caracteristicas = request.form.get("caracteristicas",None)
            mascota.medicacion = request.form.get("medicacion",None)
            mascota.vacunacion = request.form.get("vacunacion",None)
            mascota.enfermedades = request.form.get("enfermedades",None)
            mascota.cirugias = request.form.get("cirugias",None)

            if request.form.get("fecha_nacimiento",None) is not None and request.form.get("fecha_nacimiento",None) != "null":
                mascota.fecha_nacimiento = datetime(int(request.form.get("fecha_nacimiento",None).split("-")[0]),
                                                    int(request.form.get("fecha_nacimiento",None).split("-")[1]),
                                                    int(request.form.get("fecha_nacimiento",None).split("-")[2]))

            if request.form.get("castracion",None)  is not None and request.form.get("castracion",None)  != "null":
                mascota.castracion = request.form.get("castracion",None)  == "true"

            if request.form.get("tipo_mascota",None) is not None and request.form.get("tipo_mascota",None) != "null":
                mascota.tipo_mascota_id = request.form.get("tipo_mascota",None)

            if request.form.get("raza_mascota",None) is not None and request.form.get("raza_mascota",None) != "null":
                mascota.raza_mascota_id = request.form.get("raza_mascota",None)

            if 'imagen' in request.files:
                file = request.files.get('imagen')
                if file and file.content_type.startswith('image'):
                    if file.content_type != 'image/jpeg':
                        return jsonify({'msg':'La imagen ingresada no es JPG'}),400,{'ContentType':'application/json'}
                else:
                    return jsonify({'msg':'El archivo ingresado no es una imagen'}),400,{'ContentType':'application/json'}

                img = resize_and_save_image(request.files.get("imagen").read())
                mascota.imagen = img if img != False else None

            mascota.updated_at = datetime.now()

            mascota.save()

            return mascota.to_dict()
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error al editar la mascota'}),400,{'ContentType':'application/json'}

    @app.route("/mascota/eliminar/<id>", methods=["DELETE"])
    @jwt_required()
    def eliminarMascota(id):
        try:
            mascota:Mascota = Mascota.buscarMascotaPorID(id)
            user = UsuarioPadre.buscarUsuarioPorID(get_jwt_identity()[1])
            if mascota is None or not mascota.enabled:
                return jsonify({'msg':'No existe una mascota con id {} en el sistema'.format(id)}),400,{'ContentType':'application/json'}
            elif user not in mascota.dueños:
                return jsonify({'msg':'El usuario iniciado no tiene permiso para acceder a eliminar la mascota {}'.format(id)}),401,{'ContentType':'application/json'}
            try:
                user.mascotas.remove(mascota)
                user.save()
                if len(mascota.dueños)==0:
                    mascota.eliminar()
                return jsonify({'msg':'Mascota eliminada con exito'}),200,{'ContentType':'application/json'}
            except:
                return jsonify({'msg':'Ocurrio un error al eliminar la mascota'}),400,{'ContentType':'application/json'}
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error al eliminar la mascota'}),400,{'ContentType':'application/json'}

    @app.route("/mascota/agregar_owner/<id>/qr")
    @jwt_required()
    def agregarOwnerQR(id):
        try:
            mascota: Mascota = Mascota.buscarMascotaPorID(id)
            if mascota is None:
                return jsonify({'msg':'La mascota no existe u ocurrio un error recuperando su informacion'}),400,{'ContentType':'application/json'}

            import qrcode
            import io
            mascota:Mascota = Mascota.buscarMascotaPorID(id)
            if UsuarioPadre.buscarUsuarioPorID(get_jwt_identity()[1]) not in mascota.dueños:
                return jsonify({'msg':'Debe ser dueño de la mascota {} para obtener el qr de añadido rapido'.format(id)}),400,{'ContentType':'application/json'}

            verificador = generate_password_hash(str(UsuarioPadre.buscarUsuarioPorID(get_jwt_identity()[1]).to_dict()), "sha256", 32).replace("sha256$","")

            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=20,
                border=1,
            )

            qr.add_data("https://betaapp.pythonanywhere.com/mascota/agregado_rapido/{0}/{1}".format(id,verificador))
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")

            # Convertimos la imagen a formato JPEG
            with io.BytesIO() as buffer:
                img.save(buffer, format='JPEG')
                buffer.seek(0)
                # return Response(buffer.read(), mimetype='image/jpeg')
                from base64 import b64encode
                base64 = b64encode(buffer.read())
                return jsonify({"base64":base64.decode()}),200,{"ContentType":"application/json"}

        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error al obtener el qr para añadir un dueño a la mascota'}),400,{'ContentType':'application/json'}

    @app.route("/mascota/agregado_rapido/<id>/<verificador>")
    @jwt_required()
    def agregadoRapidoMascota(id, verificador):
        try:
            mascota:Mascota = Mascota.buscarMascotaPorID(id)
            if mascota is None or not mascota.enabled:
                return jsonify({'msg':'La mascota no existe u ocurrio un error recuperando su informacion'}),400,{'ContentType':'application/json'}

            usuario:UsuarioPadre = UsuarioPadre.buscarUsuarioPorID(get_jwt_identity()[1])
            if usuario in mascota.dueños:
                return jsonify({'msg':'El usuario iniciado ya es dueño de la mascota seleccionada'}),400,{'ContentType':'application/json'}

            for owner in mascota.dueños:
                if check_password_hash("sha256$"+verificador,str(owner.to_dict())):
                    usuario.mascotas.append(mascota)
                    usuario.save()
                    return jsonify([m.to_dict() for m in usuario.mascotas if m.enabled]),200,{'ContentType':'application/json'}

            return jsonify({'msg':'El qr obtenido no fue generado por un dueño de la mascota indicada'}),400,{'ContentType':'application/json'}
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'msg':'Ocurrio un error al obtener el qr para añadir un dueño a la mascota'}),400,{'ContentType':'application/json'}


    @app.route('/listado/razas/<tipo_mascota>', methods=["GET"])
    def razasPorTipoMascota(tipo_mascota):
        razas = Raza_Mascota.query.filter_by(tipo_mascota_id=tipo_mascota).all()
        raza_mestizo = Raza_Mascota.query.filter_by(tipo_mascota_id=tipo_mascota, raza="Mestizo").first()
        # razas = list(filter(lambda r: r != raza_mestizo), razas)
        razas.remove(raza_mestizo)
        razas.sort(key= lambda r: r.raza)
        razas.insert(0, raza_mestizo)

        return jsonify({"razas":[r.to_dict() for r in razas]}),200,{"ContentType": 'application/json'}

    @app.route('/listado/razas', methods=["GET"])
    def razas():
        razas = Raza_Mascota.query.all()
        razas_mestizas = []
        for each in razas:
            if each.raza == "Mestizo":
                razas_mestizas.append(each)
        for each in razas_mestizas:
            razas.remove(each)
        razas.sort(key=lambda r: r.raza)
        razas = razas_mestizas + razas
        return jsonify({"razas":[r.to_dict() for r in razas]}),200,{"ContentType": 'application/json'}

    @app.route('/listado/tipos', methods=["GET"])
    def tipos():
        tipos = Tipo_Mascota.query.all()
        return jsonify({"tipos":[t.to_dict() for t in tipos]}),200,{"ContentType": 'application/json'}

    @app.route('/listado/colores', methods=["GET"])
    def colores():
        ### Return colores
        colores = [ "Blanco", "Negro", "Marron Claro", "Marron Oscuro", "Gris", "Naranja", "Amarillo", "Beige"]
        # Return colores with id in "colores"
        colores.sort()
        return jsonify( {"colores":[{"id":i+1,"nombre":colores[i]} for i in range(len(colores))]}),200,{"ContentType": 'application/json'}



    #### IMAGENES =================================================================================================

    @app.route("/imagen/<id>", methods=["GET"])
    def imagenPorId(id):
        import io
        from flask import send_file, send_from_directory

        if id=="null" or id=="undefined":
            return send_from_directory(directory='static', path='user_default_pic.jpg')
        try:
            image = Imagen.query.filter_by(id=id).first()
            if image is None:
                return None
        except:
            return None
        imagen_io = io.BytesIO(image.contenido)
        return send_file(imagen_io, mimetype='image/jpeg')

    def resize_and_save_image(file):
        try:
            from io import BytesIO
            import piexif

            original_image = Image.open(BytesIO(file))


            if original_image.size[0] < 1024 and original_image.size[1] < 1024:
                # No hace falta achicarla y si la intentamos agrandar puede q se rompa
                img = Imagen(file)
                img.save()
                return img

            exif_dict = original_image.info.get("exif")
            if exif_dict is not None:
                exif_data = piexif.load(exif_dict)
                if piexif.ImageIFD.Orientation in exif_data["0th"]: # TypeError: 'JpegImageFile' object is not subscriptable
                    orientation = exif_data["0th"].pop(piexif.ImageIFD.Orientation)
                    if orientation == 2:
                        original_image = original_image.transpose(Image.FLIP_LEFT_RIGHT)
                    elif orientation == 3:
                        original_image = original_image.rotate(180)
                    elif orientation == 4:
                        original_image = original_image.rotate(180).transpose(Image.FLIP_LEFT_RIGHT)
                    elif orientation == 5:
                        original_image = original_image.rotate(-90, expand=True).transpose(Image.FLIP_LEFT_RIGHT)
                    elif orientation == 6:
                        original_image = original_image.rotate(-90, expand=True)
                    elif orientation == 7:
                        original_image = original_image.rotate(90, expand=True).transpose(Image.FLIP_LEFT_RIGHT)
                    elif orientation == 8:
                        original_image = original_image.rotate(90, expand=True)



            width, height = original_image.size
            aspect_ratio = width / height
            new_width, new_height = (width, height)
            if width > height:
                new_width = 1024
                new_height = int(new_width / aspect_ratio)
            else:
                new_height = 1024
                new_width = int(new_height * aspect_ratio)

            resized_image = original_image.resize((new_width, new_height))


            stream = BytesIO()
            resized_image.save(stream, format="JPEG")
            imagebytes = stream.getvalue()
            img = Imagen(imagebytes)
            img.save()
            return img
        except:
            import traceback
            traceback.print_exc()
            print("FAllo")
            return False

    @app.route("/nuevaimagen", methods=["GET"])
    def imagennueva():
        return str(resize_and_save_image(request.files.get("imagen").read()) is not None)

    @app.route("/app/descargar/android", methods=["GET"])
    def descargar_android():
        from flask import send_from_directory
        try:
            return send_from_directory(directory='static', path='BETA.apk', as_attachment=True)
        except:
            import traceback
            traceback.print_exc()
            return jsonify({"msg":"Algo salio mal"}),400,{"ContentType":"application/json"}

    @app.route("/app/descargar", methods=["GET"])
    def descargar_pagina():
        return render_template("descargar.html")

    @app.route("/app", methods=["GET"])
    def main_pagina():
        return render_template("index.html")

    @app.route("/", methods=["GET"])
    def redirect_main_pagina():
        return redirect("/app")


    # @app.route("/.well-known/assetlinks.json", methods=["GET"])
    def assetlinks():
        from flask import send_from_directory
        return send_from_directory(directory='static', path='assetlinks.json')

    @app.errorhandler(500)
    def internal_error(error):
        import traceback
        traceback.print_exc()
        disc = int(request.args.get('disc', '0'))
        if disc==0:
            if "gestion" in request.url:
                return redirect(url_for("login_administrativo")+"?disc=1")
            else:
                return redirect(url_for("alumno_login")+"?disc=1")
        else:
            return "Server Error"

    @app.errorhandler(404)
    def page_not_found(e):
        # return jsonify({'msg':'Parece que la pagina que estas buscando no existe...'}),404,{'ContentType':'application/json'}
        return render_template("404.html")


    return app
