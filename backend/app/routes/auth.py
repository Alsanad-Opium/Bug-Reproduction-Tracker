from flask_jwt_extended  import create_access_token,jwt_required, get_jwt_identity,get_jwt,verify_jwt_in_request 
from flask import Blueprint, request,jsonify
from app import db,bcrypt
from app.models.users import User
from datetime import timedelta
from functools import wraps

auth_bp = Blueprint('auth',__name__,url_prefix='/auth')

# Helper func for authorization 
def require_role(*roles):
    def wrapper(fn):
        

        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get("role")

            if user_role not in roles:
                return jsonify({"message": "Forbidden"}), 403

            return fn(*args, **kwargs)
        return decorator
    return wrapper

@auth_bp.route('/register/', methods = ['POST'], strict_slashes = False)

def register():
    
    data = request.get_json()
    
    
    if not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Username email and password are required fields"}),400
       
    
    existing_email = User.query.filter_by(email = data['email']).first()
    existing_username = User.query.filter_by(name = data['name']).first()
    
    if existing_email or existing_username:
        return jsonify({"message": "Email or username already exists"}),409

    allowed_self_service_roles = ['TESTER', 'DEVELOPER']
    role = data.get('role', 'TESTER')

    if role not in allowed_self_service_roles:
        return jsonify({"message": "role must be TESTER or DEVELOPER"}), 400
    
    user = User(name = data['name'],
                email= data['email'],
                role = role)
    user.set_password(data.get('password'))
                        

    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': "User Registered Successfully",'user':user.to_dict()}),201
    
    
@auth_bp.route('/login/', methods = ['POST'])
def login():
    
    data= request.get_json()
    
    if not data.get('email')or not data.get('password'):
        return jsonify({"message": "Username email and password are required fields"}),400
    
    user = User.query.filter_by(email = data['email']).first()
    
    if not user or not  user.check_password(data['password']):

        return jsonify({'message': 'Invalid email or password'}), 401

    access_token  = create_access_token(identity = str(user.id),additional_claims = {'role':user.role}, expires_delta = timedelta(hours = 1))

    return jsonify({
                    'access_token': access_token,
                    'message': "Login successful",
                    'user': user.to_dict() }), 200   
    
@auth_bp.route('/me',methods = ['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = db.session.get(User,str(user_id))
    
    return jsonify({'message': 'User fetched',
                    'user':user.to_dict()}), 200