from os import environ
from dotenv import load_dotenv

class BaseConfig(object):
    """Base configuration."""

    DEBUG = None
    DB_HOST = "bd_name"
    DB_USER = "db_user"
    DB_PASS = "db_pass"
    DB_NAME = "db_name"
    SECRET_KEY = "secret"

    load_dotenv()

    @staticmethod
    def configure(app):
        # Implement this method to do further configuration on your app.
        pass


class DevelopmentConfig(BaseConfig):
    """Development configuration."""

    ENV = "development"
    DEBUG = environ.get("DEBUG", True)
    DB_HOST = environ.get("DB_HOST", "localhost")
    DB_USER = environ.get("DB_USER", "root")
    DB_PASS = environ.get("DB_PASS", "Mysqlroot.1")
    DB_NAME = environ.get("DB_NAME", "beta_app")

class TestingConfig(BaseConfig):
    """Testing configuration."""

    ENV = "testing"
    TESTING = True
    DEBUG = environ.get("DEBUG", True)
    DB_HOST = environ.get("DB_HOST", "localhost")
    DB_USER = environ.get("DB_USER", "root")
    DB_PASS = environ.get("DB_PASS", "root")
    DB_NAME = environ.get("DB_NAME", "beta_app")


class ProductionConfig(BaseConfig):
    """Production configuration."""

    ENV = "production"
    DEBUG = environ.get("DEBUG", False)
    DB_HOST = environ.get("DB_HOST", "betaapp.mysql.pythonanywhere-services.com")
    DB_USER = environ.get("DB_USER", "betaapp")
    DB_PASS = environ.get("DB_PASS", "YmV0YV9hcHBfbXlzcWw=")
    DB_NAME = environ.get("DB_NAME", "betaapp$beta_app")


config = dict(
    development=DevelopmentConfig, testing=TestingConfig, production=ProductionConfig
)
