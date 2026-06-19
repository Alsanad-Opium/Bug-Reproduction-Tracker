from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.routes.auth import require_role
from app.services.user_service import UserService

user_bp = Blueprint('users', __name__, url_prefix='/api/users')


@user_bp.route('/<int:user_id>/role', methods=['PUT'], strict_slashes=False)
@jwt_required()
@require_role('ADMIN')
def update_user_role(user_id):
    data = request.get_json()
    result = UserService.update_role(user_id, data.get('role'))

    if result['status'] == 'not_found':
        return jsonify({"message": "User not found"}), 404

    if result['status'] == 'invalid':
        return jsonify({"message": result['message']}), 400

    return jsonify({"message": "Role updated successfully", "user": result['user']}), 200