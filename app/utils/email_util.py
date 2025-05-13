import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging
import ssl

# Configure logging
logging.basicConfig(level=logging.INFO)

def send_verification_email(email, verification_code):
    """
    Send a verification email with a token.

    Note:
    - Ensure SMTP_EMAIL and SMTP_PASSWORD environment variables are set correctly.
    - If using Gmail with 2FA enabled, use an App Password instead of your regular password.
    - SMTP_SERVER defaults to smtp.gmail.com and SMTP_PORT defaults to 587 (STARTTLS).
    """
    sender_email = os.getenv("SMTP_EMAIL")
    sender_password = os.getenv("SMTP_PASSWORD")
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = os.getenv("SMTP_PORT", "587")

    if not sender_email or not sender_password:
        raise ValueError("SMTP_EMAIL and SMTP_PASSWORD environment variables must be set.")

    try:
        smtp_port = int(smtp_port)
    except ValueError:
        raise ValueError("SMTP_PORT environment variable must be an integer.")

    logging.info(f"Using SMTP server: {smtp_server} on port {smtp_port} with user {sender_email}")

    subject = "Verify Your Email - Vetty"
    html_content = f"""
    <p>Thank you for registering with Vetty!</p>
    <p>Please use the following verification code to verify your email:</p>
    <h3>{verification_code}</h3>
    <p>If you did not request this, please ignore this email.</p>
    """
    plain_text_content = f"""
    Thank you for registering with Vetty!
    Please use the following verification code to verify your email: {verification_code}
    If you did not request this, please ignore this email.
    """

    message = MIMEMultipart("alternative")
    message["From"] = sender_email
    message["To"] = email
    message["Subject"] = subject
    message.attach(MIMEText(plain_text_content, "plain"))
    message.attach(MIMEText(html_content, "html"))

    context = ssl.create_default_context()
    try:
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_server, smtp_port, context=context) as server:
                server.login(sender_email, sender_password)
                server.sendmail(sender_email, email, message.as_string())
        else:
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls(context=context)
                server.login(sender_email, sender_password)
                server.sendmail(sender_email, email, message.as_string())
        logging.info(f"Verification email sent to {email}")
    except smtplib.SMTPAuthenticationError as e:
        logging.error("Failed to authenticate with the SMTP server. Check your email and password. Ensure you are using an App Password if you have 2FA enabled on your email account.")
        logging.error(f"SMTPAuthenticationError details: {e}")
        raise
    except smtplib.SMTPException as e:
        logging.error(f"SMTP error occurred: {e}")
        raise
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}")
        raise

def send_password_reset_email(email, verification_code):
    """
    Send a password reset email with a verification code.

    Note:
    - Ensure SMTP_EMAIL and SMTP_PASSWORD environment variables are set correctly.
    """
    sender_email = os.getenv("SMTP_EMAIL")
    sender_password = os.getenv("SMTP_PASSWORD")
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = os.getenv("SMTP_PORT", "587")

    if not sender_email or not sender_password:
        raise ValueError("SMTP_EMAIL and SMTP_PASSWORD environment variables must be set.")

    try:
        smtp_port = int(smtp_port)
    except ValueError:
        raise ValueError("SMTP_PORT environment variable must be an integer.")

    logging.info(f"Using SMTP server: {smtp_server} on port {smtp_port} with user {sender_email}")

    subject = "Your Password Reset Verification Code - Vetty"
    html_content = f"""
    <p>You requested to reset your password.</p>
    <p>Please use the following verification code to reset your password:</p>
    <h3>{verification_code}</h3>
    <p>If you did not request this, please ignore this email.</p>
    """
    plain_text_content = f"""
    You requested to reset your password.
    Please use the following verification code to reset your password: {verification_code}
    If you did not request this, please ignore this email.
    """

    message = MIMEMultipart("alternative")
    message["From"] = sender_email
    message["To"] = email
    message["Subject"] = subject
    message.attach(MIMEText(plain_text_content, "plain"))
    message.attach(MIMEText(html_content, "html"))

    context = ssl.create_default_context()
    try:
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_server, smtp_port, context=context) as server:
                server.login(sender_email, sender_password)
                server.sendmail(sender_email, email, message.as_string())
        else:
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls(context=context)
                server.login(sender_email, sender_password)
                server.sendmail(sender_email, email, message.as_string())
        logging.info(f"Password reset email sent to {email}")
    except smtplib.SMTPAuthenticationError as e:
        logging.error("Failed to authenticate with the SMTP server. Check your email and password. Ensure you are using an App Password if you have 2FA enabled on your email account.")
        logging.error(f"SMTPAuthenticationError details: {e}")
        raise
    except smtplib.SMTPException as e:
        logging.error(f"SMTP error occurred: {e}")
        raise
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}")
        raise
