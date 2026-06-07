from flask import Blueprint, request, jsonify
from app import db
from app.routes.auth import require_role
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.projects import Project

project_bp = Blueprint('project_bp', __name__, url_prefix = '/api/projects')


@project_bp.route('', methods = ['GET'], strict_slashes = False)
@require_role('ADMIN','TESTER')
@jwt_required()
def get_all_projects():
    projects = Project.query.all()
    
    if projects is None:
        return jsonify({"message":"No projects found"}),404 # if db is empty
    return jsonify([project.to_dict() for project in projects]), 200




@project_bp.route('/<int:id>', methods = ['GET'], strict_slashes = False)
@require_role('ADMIN','TESTER','DEVELOPER')
@jwt_required()
def get_project(id):
    project = db.session.get(Project,id)
    if project is None:
        return jsonify({"message":"Project not found"}),404
    return jsonify(project.to_dict()), 200


@project_bp.route('',methods = ['POST'], strict_slashes = False)
@require_role('ADMIN')
@jwt_required()
def create_project():
    data = request.get_json()
    
    if not data or not data['name'] or not data['description'] :
        return jsonify({"message":"Missing required fields (Name and Description required )"}),400
    
    user_id = get_jwt_identity()
    project = Project(name = data['name'],
                      description = data['description'], 
                      owner_id = user_id
    )
    db.session.add(project)
    db.session.commit()
    
    return jsonify({'message': 'project created succesfully', 'project': project.to_dict()}),201

@project_bp.route('/<int:id>',methods = ['PUT'], strict_slashes=False) 
@require_role('ADMIN')
@jwt_required()
def update_project(id):
    user_id = get_jwt_identity() 
    project = db.session.get(Project,id)
    
    if project is None:
        return jsonify({'message': 'project not found'}),404
    
    if project.owner_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403
    
    data = request.get_json()
    
    project.name =  data.get('name',project.name)
    project.description = data.get('description',project.description)
      
    db.session.add(project)
    db.session.commit()
    
    return jsonify({'message': 'project updated successfully',
                    'project': project.to_dict()})