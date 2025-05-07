import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import current_app

def send_verification_email(to_email, token):
    """
    Send an email with a black button to verify the user's email address.
    """
    try:
        smtp_server = current_app.config.get('SMTP_SERVER')
        smtp_port = current_app.config.get('SMTP_PORT')
        smtp_username = current_app.config.get('SMTP_EMAIL')
        smtp_password = current_app.config.get('SMTP_PASSWORD')
        from_email = current_app.config.get('MAIL_DEFAULT_SENDER')

        # Validation for required config values
        if not smtp_server:
            raise ValueError("SMTP_SERVER configuration is missing.")
        if not smtp_port:
            raise ValueError("SMTP_PORT configuration is missing.")
        if not smtp_username:
            raise ValueError("SMTP_EMAIL configuration is missing.")
        if not smtp_password:
            raise ValueError("SMTP_PASSWORD configuration is missing.")
        if not from_email:
            raise ValueError("MAIL_DEFAULT_SENDER configuration is missing.")

        verify_url = f"{current_app.config.get('FRONTEND_URL')}/verify-email?token={token}"

        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Verify Your Email"
        msg['From'] = from_email
        msg['To'] = to_email

        html = f"""
        <html>
          <body>
            <p>Please verify your email by clicking the button below:</p>
            <a href="{verify_url}" style="
                display: inline-block;
                padding: 12px 24px;
                font-size: 16px;
                color: white;
                background-color: black;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
            ">Verify Your Email</a>
            <p>If you did not create an account, please ignore this email.</p>
          </body>
        </html>
        """

        part = MIMEText(html, 'html')
        msg.attach(part)

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.sendmail(from_email, to_email, msg.as_string())

    except Exception as e:
        current_app.logger.error(f"Failed to send verification email to {to_email}: {e}")
        raise

def send_password_reset_email(to_email, token):
    """
    Send an email with a black button to reset the user's password.
    """
    try:
        smtp_server = current_app.config.get('SMTP_SERVER')
        smtp_port = current_app.config.get('SMTP_PORT')
        smtp_username = current_app.config.get('SMTP_EMAIL')
        smtp_password = current_app.config.get('SMTP_PASSWORD')
        from_email = current_app.config.get('MAIL_DEFAULT_SENDER')

        # Validation for required config values
        if not smtp_server:
            raise ValueError("SMTP_SERVER configuration is missing.")
        if not smtp_port:
            raise ValueError("SMTP_PORT configuration is missing.")
        if not smtp_username:
            raise ValueError("SMTP_EMAIL configuration is missing.")
        if not smtp_password:
            raise ValueError("SMTP_PASSWORD configuration is missing.")
        if not from_email:
            raise ValueError("MAIL_DEFAULT_SENDER configuration is missing.")

        reset_url = f"{current_app.config.get('FRONTEND_URL')}/reset-password?token={token}"

        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Reset Your Password"
        msg['From'] = from_email
        msg['To'] = to_email

        html = f"""
        <html>
          <body>
            <p>You requested a password reset. Click the button below to reset your password:</p>
            <a href="{reset_url}" style="
                display: inline-block;
                padding: 12px 24px;
                font-size: 16px;
                color: white;
                background-color: black;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
            ">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
          </body>
        </html>
        """

        part = MIMEText(html, 'html')
        msg.attach(part)

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.sendmail(from_email, to_email, msg.as_string())

    except Exception as e:
        current_app.logger.error(f"Failed to send password reset email to {to_email}: {e}")
        raise
