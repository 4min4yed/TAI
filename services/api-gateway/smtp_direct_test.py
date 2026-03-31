import smtplib
from email.mime.text import MIMEText
from app.core.config import Settings

settings = Settings()
recipient = "mohamedamain.ayed@supcom.tn"

msg = MIMEText("Standalone SMTP test from api-gateway")
msg["Subject"] = "TAI SMTP Direct Test"
msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_EMAIL}>"
msg["To"] = recipient

server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=20)
server.set_debuglevel(1)
server.starttls()
server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
resp = server.sendmail(settings.SMTP_EMAIL, [recipient], msg.as_string())
server.quit()
print("sendmail_resp:", resp)
print("SMTP_SEND_OK")
