
import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'fallback-secret-key')

    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'fallback-jwt-secret')

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        minutes=1
    )

    # JWT_EXPIRATION_HOURS = int(
    #     os.getenv('JWT_EXPIRATION_HOURS', 24)
    # )

    # JWT_ACCESS_TOKEN_EXPIRES = timedelta(
    #     hours=JWT_EXPIRATION_HOURS
    # )

  