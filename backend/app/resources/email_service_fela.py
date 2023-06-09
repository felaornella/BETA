import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.helpers import emailKey


def enviar_mail_recuperacion(user, tempPass):
    try:
        sender_email = emailKey.email
        receiver_email = user.email
        password = emailKey.password

        message = MIMEMultipart("alternative")
        message["Subject"] = "Reestablecer Contraseña"
        message["From"] = sender_email
        message["To"] = receiver_email

        urlLogo=""

        # Create the plain-text and HTML version of your message
        text = """\
        REESTABLECER CONTRASEÑA
        Para reestablecer la clave debe iniciar sesión en la app utilizando el codigo dado a continuación como contraseña. Una vez iniciada sesion se le pedirá que reestablezca su contraseña.
        Por favor NO COMPARTA ESTE CODIGO CON NADIE. Si no solicitaste este codigo por favor ignora este correo.
        Codigo:  """ + tempPass.upper()
        html = """\
        <html>
            <body>
                <div style="display: flex; justify-content: center;">
                    <div>
                        <div style="text-align: center;">
                            <h2 style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; opacity: 0.85; text-decoration: underline;">B.E.T.A App</h2>
                            <br>
                            <h3 style="color: #59574F; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">RECUPERACIÓN DE CONTRASEÑA</h3>
                            <p style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 1.2rem; text-align: justify;">
                                Para reestablecer la clave debe iniciar sesión en la app utilizando el codigo dado a continuación como contraseña. Una vez iniciada sesion se le pedirá que reestablezca su contraseña.<br><br>
                                Por favor <strong>no comparta este codigo con nadie.</strong> Si no solicitaste este codigo por favor ignora este correo.
                            </p>
                            <br>
                            <br>
                            <div style="width: 100%; display: flex; justify-content:center;">
                                <table style="border: 1px solid; padding:10px; text-align:left">
                                    <tr>
                                        <td style="padding: 8px">
                                            <label style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; opacity: 0.7; font-weight: bolder; font-size: larger ;text-decoration: underline;">Código</label>
                                        </td>
                                        <td style="padding: 8px">
                                            <span style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-weight: bolder; font-size: x-large">"""+tempPass.upper()+"""</span>
                                        </td>
                                    </tr>
                                </table>                        
                            </div>
                            <br>
                        </div>
                    </div>
                </div> 
            </body>
        </html>
        """

        # Turn these into plain/html MIMEText objects
        part1 = MIMEText(text, "plain")
        part2 = MIMEText(html, "html")

        # Add HTML/plain-text parts to MIMEMultipart message
        # The email client will try to render the last part first
        message.attach(part1)
        message.attach(part2)

        # Create secure connection with server and send email
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(sender_email, password)
            server.sendmail(
                sender_email, receiver_email, message.as_string()
            )
        
        return True
    except:
        return False
