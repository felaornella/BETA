from app.models.usuario import Usuario

def autenticar(email, password):
    return Usuario.validarDatosEntrada(email, password)