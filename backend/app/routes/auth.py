from flask_jwt_extended  import create_access_token,jwt_required, get_jwt_identity 
from flask import Blueprint, request,jsonify
from app import db,bcrypt
from app.models.users import User
from datetime import timedelta

auth_bp = Blueprint('auth',__name__,'/auth')

@auth_bp.route('/register/', methods = ['POST'], strict_slashes = False)

def register():
    
    data = request.get_json()
    
    
    if not data.get('name') or not data.get('email') or not data.get('password_hash'):
        return jsonify({"message": "Username email and password are required fields"}),400
    
    existing_email = User.query.filter_by(email = data['email']).first()
    existing_username = User.query.filter_by(name = data['name']).first()
    
    if existing_email or existing_username:
        return jsonify({"message": "Email or username already exists"}),409

    
    
    password_hashed  = User.set_password(data.get('password_hashed'))
    user = User(name = data['name'],
                email= data['email'],
                password_hash = password_hashed
                                )
    
    db.session.add(user)
    db.session.commit()
    
    
@auth_bp.route('/login/',__name__, methods = ['POST'])
def login():
    
    data= request.get_json()
    
    if not data.get('email')or not data.get('name')or not data.get('passoword'):
        return jsonify({"message": "Username email and password are required fields"}),400
    
    user = User.query.filter_by(email = data['email']).first()
    
    if not user or not  bcrypt.check_password_hash(user.password, data['password_hash']):

        return jsonify({'message': 'Invalid email or password'}), 401

    access_token  = create_access_token(identity = str(user.id), expires_delta = timedelta(hours = 1))

    return jsonify({
                    'access_token': access_token,
                    'message': "Login successful",
                    'user': user.to_dict() }), 200
    
@auth_bp.route('/me',methods = ['GET'])
@jwt_required
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    return jsonify({'message': 'User fetched',
                    'user':user.to_dict()}), 200