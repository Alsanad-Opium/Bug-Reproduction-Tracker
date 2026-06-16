from app.models.bugs import Bug
from app.models.comments import Comment
from app import db


class CommentService:
    
    @staticmethod
    def add_comment(data, bug_id, user_id):
        bug = db.session.get(Bug, bug_id)
        if bug is None:
            return {'status': 'not_found'}

        if not data or not data.get('content'):
            return {'status': 'invalid'}

        comment = Comment(
            user_id=user_id,
            bug_id=bug_id,
            content=data['content']
        )
        db.session.add(comment)
        db.session.commit()

        return {'status': 'success', 'comment': comment.to_dict()}
     
    @staticmethod    
    def list_attempts(bug_id):
    
        comments = Comment.query.filter_by(bug_id=bug_id).order_by(Comment.created_at.asc()).all()
                
        return  [c.to_dict() for c in comments]