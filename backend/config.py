import os
from dotenv import load_dotenv

load_dotenv()
class Config:
    
    raw_url  = os.getenv('DATABASE_URL')
    SQLALCHEMY_DATABASE_URI = raw_url.replace('postgres://', 'postgresql://') 
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')