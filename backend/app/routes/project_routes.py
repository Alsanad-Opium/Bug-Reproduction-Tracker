from flask import Blueprint, request, jsonify
from app.routes.auth import require_role
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.project_service import ProjectService

project_bp = Blueprint('project_bp', __name__, url_prefix='/api/projects')


@project_bp.route('', methods=['GET'], strict_slashes=False)
@require_role('ADMIN', 'TESTER')
@jwt_required()
def get_all_projects():
    projects = ProjectService.get_all()
    if not projects:
        return jsonify({"message": "No projects found"}), 404
    return jsonify(projects), 200


@project_bp.route('/<int:id>', methods=['GET'], strict_slashes=False)
@require_role('ADMIN', 'TESTER', 'DEVELOPER')
@jwt_required()
def get_project(id):
    project_data = ProjectService.get_project(id)
    if project_data is None:
        return jsonify({"message": "Project not found"}), 404
    return jsonify(project_data), 200


@project_bp.route('', methods=['POST'], strict_slashes=False)
@require_role('ADMIN')
@jwt_required()
def create_project():
    data = request.get_json()
    user_id = int(get_jwt_identity())

    if not data or not data.get('name') or not data.get('description'):
        return jsonify({"message": "name and description are required"}), 400

    project_data = ProjectService.create_project(data, user_id)
    return jsonify({'message': 'Project created successfully', 'project': project_data}), 201


@project_bp.route('/<int:id>', methods=['PUT'], strict_slashes=False)
@require_role('ADMIN')
@jwt_required()
def update_project(id):
    data = request.get_json()
    user_id = int(get_jwt_identity())

    result = ProjectService.update_project(id, data, user_id)

    if result['status'] == 'not_found':
        return jsonify({'message': 'Project not found'}), 404

    if result['status'] == 'unauthorized':
        return jsonify({'message': 'Unauthorized'}), 403

    return jsonify({'message': 'Project updated successfully', 'project': result['project']}), 200