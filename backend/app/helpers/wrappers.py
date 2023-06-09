from functools import wraps
from flask_login import current_user
from flask import redirect,url_for, session

def es_usuario(function):
    @wraps(function)
    def es_usuario(*args, **kwargs):
        if current_user.usu is None:
            print("Es Organizacion")
            return redirect(url_for("login_organizacion"))
        return function(*args, **kwargs)
    return es_usuario

def es_organizacion(function):
    @wraps(function)
    def es_organizacion(*args, **kwargs):
        if current_user.orga is None:
            print("Es Usuario")
            return redirect(url_for("login_usuario"))
        return function(*args, **kwargs)
    return es_organizacion
