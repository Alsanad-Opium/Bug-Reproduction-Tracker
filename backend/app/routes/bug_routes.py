from flask import Blueprint, request, jsonify
from app import db
from app.models.bugs import Bug
from app.models.projects import Project
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.routes.auth import require_role
from app.services.bugs_service import BugService

bugs_bp = Blueprint('bugs', __name__, url_prefix='/api/bugs')


@bugs_bp.route('', methods=['GET'], strict_slashes=False)
@jwt_required()
@require_role('ADMIN', 'TESTER')
def get_all_bugs():
    user_id = int(get_jwt_identity())
    
    page = request.args.get('page',1,type = int)
    per_page = request.args.get('per_page',10,type = int)
    
    result = BugService.get_all_bugs(user_id,page,per_page)
    
    if result['status'] == "Not_found" :
        return jsonify({"message": "No bugs found"}), 404
    
    return jsonify( result['data']), 200


@bugs_bp.route('/debug', methods=['GET'], strict_slashes=False)
@jwt_required()
def token_claims():
    claims = get_jwt()
    identity = get_jwt_identity()
    return jsonify({"claims": claims, "identity": identity}), 200


@bugs_bp.route('/<int:bug_id>', methods=['GET'], strict_slashes=False)
@jwt_required()
@require_role('ADMIN', 'TESTER', 'DEVELOPER')
def get_bug(bug_id):
    result  = BugService.get_bug(bug_id)
    if result['status'] == 'Not_found':
        return jsonify({"message": "Bug not found"}), 404
    return jsonify(result['bug']), 200


@bugs_bp.route('', methods=['POST'], strict_slashes=False)
@jwt_required()
@require_role('ADMIN', 'TESTER', 'DEVELOPER')
def create_bug():
    data = request.get_json()
    user_id = int(get_jwt_identity())
    

    if not data or not data.get('title') or not data.get('project_id'):
        return jsonify({"message": "title and project_id are required"}), 400

    result = BugService.create_bug(data,user_id)
    
    if result['status'] == "Project not found" :
        return jsonify({"message": "Project not found"}), 404

    if result['status'] == "Unauthorized":
        return jsonify({"message": "Unauthorized"}), 403

    return jsonify({"message": "Bug created successfully", "bug": result['bug']}), 201


@bugs_bp.route('/<int:bug_id>/status', methods=['PUT'], strict_slashes=False)
@jwt_required()
def update_bug_status(bug_id):
    
    data = request.get_json()
    result = BugService.update_bug_status(data,bug_id)
    if result['status'] == 'not_found':
        return jsonify({"message": "Bug not found"}), 404

    if result['status'] == 'Invalid status' :
            return jsonify({"message": "Invalid status"}),400
        
    return jsonify({"message": "Bug status updated successfully", "bug": result['bug']}), 200


@bugs_bp.route('/<int:bug_id>/priority', methods=['PUT'], strict_slashes=False)
@jwt_required()
def update_bug_priority(bug_id):
    
    data = request.get_json()
    result = BugService.update_bug_priority(data,bug_id)
    
    if result['status'] == 'Bug not found':
        return jsonify({"message": "Bug not found"}), 404    

    if result['status'] == "Invalid priority":
        return jsonify({"message": "Invalid priority"}), 400

    
    return jsonify({"message": "Bug priority updated successfully", "bug": result['bug']}), 200