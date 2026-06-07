from flask import Blueprint, request, jsonify
from app import db
from app.models.bugs import Bug
from app.models.projects import Project
from flask_jwt_extended import jwt_required, get_jwt_identity

bugs_bp = Blueprint('bugs',__name__,url_prefix = '/api/bugs' )

@bugs_bp.route('', methods = ['GET'], strict_slashes = False)
@jwt_required()
def get_all_bugs():
    user_id =get_jwt_identity()
    bugs = Bug.query.join(Project).filter(Project.owner_id == user_id).all()
    
    if not bugs :
        return jsonify({"message":"No bugs found"}),404 # if db is empty
    return jsonify([bug.to_dict() for bug in bugs]), 200



@bugs_bp.route('/<int:id>', methods = ['GET'], strict_slashes = False)
@jwt_required()
def get_bug(id):
    bug = db.session.get(Bug, id)
    if bug is None:
        return jsonify({"message":"Bug not found"}),404
    return jsonify(bug.to_dict()), 200

@bugs_bp.route('',methods = ['POST'], strict_slashes = False)
@jwt_required()
def create_bug():
    data = request.get_json()
    user_id =get_jwt_identity()
    if not data or not data['name'] or not data['description'] or not data['owner_id']:
        return jsonify({"message":"Missing required fields"}),400
    #check project ownership before creating a bug
    project = db.session.get(Project, data['project_id'])
    if not project:
        return jsonify({"message": "Project not found"}), 404

    if project.owner_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403
    
    bug = Bug(name = data['name'],
                      description = data['description'], 
                      project_id = data['project_id'],
                      assigned_to = data.get('assigned_to')
    )
    db.session.add(bug)
    db.session.commit()
    
    return jsonify({'message': 'bug created succesfully', 'bug': bug.to_dict()}),201

@bugs_bp.route('/<int:id>/status', methods = ['PUT'], strict_slashes = False)
@jwt_required()
def update_bug_status(id):
    bug = db.session.get(Bug,id)
    if bug is None:
        return jsonify({'message': 'bug not found'}),404
    
    data = request.get_json()
    valid_status = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]

    if data.get("status") not in valid_status:
        return jsonify({"message": "Invalid status"}), 400

    bug.status = data["status"]
    db.session.commit()
    
    return jsonify({'message': 'bug status updated sucessfully', 'bug': bug.to_dict()}),200

@bugs_bp.route('/<int:id>/priority', methods = ['PUT'], strict_slashes = False)
@jwt_required()
def update_bug_priority(id):
    bug = db.session.get(Bug,id)
    if bug is None:
        return jsonify({'message': 'bug not found'}),404
    
    data = request.get_json()
    
    bug.priority = data.get('priority', bug.priority)
    db.session.commit()
    
    return jsonify({'message': 'bug priority updated sucessfully', 'bug': bug.to_dict()}),200