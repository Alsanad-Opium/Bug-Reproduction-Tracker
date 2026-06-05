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
    from app.routes.project_routes import project_bp
    from app.routes.bug_routes import bugs_bp
    
    app.register_blueprint(project_bp)
    app.register_blueprint(ping_bp)
    app.register_blueprint(bugs_bp)
    return app
