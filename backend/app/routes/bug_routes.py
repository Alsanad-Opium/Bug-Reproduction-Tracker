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
    bugs = Bug.query.join(Project).filter(Project.owner_id == user_id).all()
    if not bugs:
        return jsonify({"message": "No bugs found"}), 404
    return jsonify([bug.to_dict() for bug in bugs]), 200


@bugs_bp.route('/debug', methods=['GET'], strict_slashes=False)
@jwt_required()
def token_claims():
    claims = get_jwt()
    identity = get_jwt_identity()
    return jsonify({"claims": claims, "identity": identity}), 200


@bugs_bp.route('/<int:id>', methods=['GET'], strict_slashes=False)
@jwt_required()
@require_role('ADMIN', 'TESTER', 'DEVELOPER')
def get_bug(id):
    bug = db.session.get(Bug, id)
    if bug is None:
        return jsonify({"message": "Bug not found"}), 404
    return jsonify(bug.to_dict()), 200


@bugs_bp.route('', methods=['POST'], strict_slashes=False)
@jwt_required()
@require_role('ADMIN', 'TESTER', 'DEVELOPER')
def create_bug():
    data = request.get_json()
    user_id = int(get_jwt_identity())

    if not data or not data.get('title') or not data.get('project_id'):
        return jsonify({"message": "title and project_id are required"}), 400

    project = db.session.get(Project, data['project_id'])
    if not project:
        return jsonify({"message": "Project not found"}), 404

    if project.owner_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    bug = Bug(
        title=data['title'],
        description=data.get('description'),
        project_id=data['project_id'],
        assigned_to=data.get('assigned_to'),
        steps_to_reproduce=data.get('steps_to_reproduce'),
        expected_result=data.get('expected_result'),
        actual_result=data.get('actual_result'),
        environment_os=data.get('environment_os'),
        environment_browser=data.get('environment_browser'),
        environment_version=data.get('environment_version')
                
    )
    db.session.add(bug)
    db.session.commit()

    return jsonify({"message": "Bug created successfully", "bug": bug.to_dict()}), 201


@bugs_bp.route('/<int:id>/status', methods=['PUT'], strict_slashes=False)
@jwt_required()
def update_bug_status(id):
    bug = db.session.get(Bug, id)
    if bug is None:
        return jsonify({"message": "Bug not found"}), 404

    data = request.get_json()
    valid_status = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]

    if data.get("status") not in valid_status:
        return jsonify({"message": "Invalid status"}), 400

    bug.status = data["status"]
    db.session.commit()

    return jsonify({"message": "Bug status updated successfully", "bug": bug.to_dict()}), 200


@bugs_bp.route('/<int:id>/priority', methods=['PUT'], strict_slashes=False)
@jwt_required()
def update_bug_priority(id):
    bug = db.session.get(Bug, id)
    if bug is None:
        return jsonify({"message": "Bug not found"}), 404

    data = request.get_json()
    valid_priority = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

    if data.get("priority") not in valid_priority:
        return jsonify({"message": "Invalid priority"}), 400

    bug.priority = data["priority"]
    db.session.commit()

    return jsonify({"message": "Bug priority updated successfully", "bug": bug.to_dict()}), 200