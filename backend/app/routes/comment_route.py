from flask import Blueprint, request, jsonify
from app.routes.auth import require_role
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.bugs import Bug
from app.services.comment_service import CommentService


comment_bp = Blueprint('comments',__name__,url_prefix = "/api/bugs") #We reuse /api/bugs as the prefix intentionally. Reproduction attempts belong to a bug, so the URLs read naturally — /api/bugs/1/attempts, /api/bugs/1/score. It makes the API self-documenting.

@comment_bp.route('/<int:bug_id>/comments',methods = ['POST'], strict_slashes = False)
@require_role('ADMIN','TESTER','DEVELOPER')
@jwt_required()
def add_comment(bug_id):
    
    data = request.get_json()      
    user_id = int(get_jwt_identity())    
    result = CommentService.add_comment(data,bug_id,user_id)
    
    if  result['status'] == "not_found":
        return jsonify({
            'message': "Bug not found"
        }),404
    
    if result['status'] == "invalid":
        return jsonify({'message': "Content not Found"})
    
    return jsonify({'message':"The comment was added",
                    'comment': result
                    })
    
@comment_bp.route('/<int:bug_id>/comments',methods = ['GET'], strict_slashes = False)
@require_role('ADMIN','TESTER','DEVELOPER')
@jwt_required()
def list_attempts(bug_id):
    
    comments = CommentService.list_attempts(bug_id)
  
    if   comments is None:
        return jsonify({
            'message': "Comments not found for the bug"
        }),404
        
        
    return jsonify({'message':"Fetched all Comments",
                    
                    'total_comments': len(comments),
                    'comments':comments
                    })
        
        
