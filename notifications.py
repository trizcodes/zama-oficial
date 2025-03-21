import os
from twilio.rest import Client
from config import Config

def send_sms_notification(to_number, message):
    account_sid = Config.TWILIO_ACCOUNT_SID
    auth_token = Config.TWILIO_AUTH_TOKEN
    from_number = Config.TWILIO_PHONE_NUMBER

    client = Client(account_sid, auth_token)
    try:
        sms = client.messages.create(
            body=message,
            from_=from_number,
            to=to_number
        )
        print("SMS enviado, SID:", sms.sid)
        return sms.sid
    except Exception as e:
        print("Erro ao enviar SMS:", e)
        return None

def notify_operator(message):
    # Número da operadora (ou de um responsável pelo monitoramento da conectividade)
    operator_number = os.environ.get("OPERATOR_PHONE_NUMBER", "+19876543210")
    return send_sms_notification(operator_number, message)

def notify_amazonas_official(message):
    # Número para notificar (pode ser de um administrador ou lista de contatos)
    amazonas_notify_number = os.environ.get("AMAZONAS_NOTIFY_NUMBER", "+11234567890")
    return send_sms_notification(amazonas_notify_number, message)