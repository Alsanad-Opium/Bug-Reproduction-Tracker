from flask import Blueprint, request, jsonify
from app import db
from app.routes.auth import require_role
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.comments import Comment
from app.models.bugs import Bug


comment_bp = Blueprint('comments',__name__,url_prefix = "/api/bugs") #We reuse /api/bugs as the prefix intentionally. Reproduction attempts belong to a bug, so the URLs read naturally — /api/bugs/1/attempts, /api/bugs/1/score. It makes the API self-documenting.

@comment_bp.route('/<int:bug_id>/comments',methods = ['POST'], strict_slashes = False)
@require_role('ADMIN','TESTER','DEVELOPER')
@jwt_required()
def add_comment(bug_id):
    
    bug = db.session.get(Bug, bug_id)
    if  bug is None:
        return jsonify({
            'message': "Bug not found"
        }),404
    user_id = int(get_jwt_identity())    
       
    data = request.get_json()      
        
    comment = Comment(
        user_id = user_id,
        bug_id = bug_id,
        content = data['content']
        
    )
    db.session.add(comment)
    db.session.commit()
    
    return jsonify({'message':"The comment was added",
                    'comment': comment.to_dict()
                    })
    
@comment_bp.route('/<int:bug_id>/comments',methods = ['GET'], strict_slashes = False)
@require_role('ADMIN','TESTER','DEVELOPER')
@jwt_required()
def list_attempts(bug_id):
    
    comments = Comment.query.filter_by(bug_id=bug_id).order_by(Comment.created_at.desc()).all
  
    if  not comments:
        return jsonify({
            'message': "Comments not found for the bug"
        }),404
        
        
    return jsonify({'message':"Fetched all Comments",
                    
                    'total_comments': len(comments),
                    'comment':[c.to_dict() for c in comments]
                    })
        
        
