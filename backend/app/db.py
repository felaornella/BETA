import pymysql

from flask import current_app
from flask import g
from flask import cli

from app.db_sqlalchemy import db_sqlalchemy as db

def connection():
    return db


def close(e=None):
    conn = g.pop("db_conn", None)

    if conn is not None:
        conn.close()


def init_app(app):
    app.teardown_appcontext(close)


def init_db(app):
    db.init_app(app)
    db.app = app
    db.create_all()

def close(e=None):
    conn = g.pop("db_conn", None)

    if conn is not None:
        conn.close()