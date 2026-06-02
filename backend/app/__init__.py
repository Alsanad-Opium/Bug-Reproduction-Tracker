from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate  import Migrate
from flask_jwt_extended import JWTManager





db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    
    app = Flask(__name__)
    
    app.config.from_object('config.Config')
    
    db.init_app(app)
    migrate.init_app(app,db)
    jwt.init_app(app)
   # print("DB URI:", app.config["SQLALCHEMY_DATABASE_URI"]) debug line to cehck database  url

    from app import models
    from app.routes.ping import ping_bp      
    app.register_blueprint(ping_bp)
    return app
