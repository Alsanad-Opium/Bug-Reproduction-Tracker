from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate  import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import click




db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()

def create_app():
    
    app = Flask(__name__)
    CORS(app)
    
    app.config.from_object('config.Config')
    
    db.init_app(app)
    migrate.init_app(app,db)
    jwt.init_app(app)
    bcrypt.init_app(app)
   # print("DB URI:", app.config["SQLALCHEMY_DATABASE_URI"]) debug line to check database  url

    from app import models
    from app.routes.ping import ping_bp      
    from app.routes.project_routes import project_bp
    from app.routes.bug_routes import bugs_bp
    from app.routes.auth import auth_bp
    from app.routes.reproduction_routes import repo_bp
    from app.routes.comment_route import comment_bp
    from app.routes.user_routes import user_bp
    
    app.register_blueprint(project_bp)
    app.register_blueprint(ping_bp)
    app.register_blueprint(bugs_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(repo_bp)
    app.register_blueprint(comment_bp)
    app.register_blueprint(user_bp)
    
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"message": "Bad request"}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"message": "Resource not found"}), 404

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({"message": "Forbidden"}), 403

    @app.errorhandler(500)
    def internal_error(e):
        db.session.rollback()
        return jsonify({"message": "An unexpected error occurred"}), 500
    
    
       

    @app.cli.command("create-admin")
    @click.argument("name")
    @click.argument("email")
    @click.argument("password")
    def create_admin(name, email, password):
        """Create an admin user. Run once during initial setup."""
        from app.models.users import User
        
        existing = User.query.filter_by(email=email).first()
        if existing:
            print(f"User with email {email} already exists.")
            return
        
        admin = User(name=name, email=email, role='ADMIN')
        admin.set_password(password)
        db.session.add(admin)
        db.session.commit()
        print(f"Admin user '{name}' created successfully.")
    return app
