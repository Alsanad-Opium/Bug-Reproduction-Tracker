from app import db
from datetime import datetime,timezone

class Comment(db.Model):
    
    __tablename__ = 'comments'
    
    id = db.Column(db.Integer,primary_key =True, nullable = False, unique = True)

    bug_id = db.Column(db.Integer, db.ForeignKey('bugs.id'), nullable = False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable = False)

    content = db.Column(db.Text, nullable = False)
    created_at = db.Column(db.DateTime, nullable = False, default = datetime.now(timezone.utc))
    
    bug = db.relationship("Bug", back_populates = "comments")
    user = db.relationship("User", back_populates = "comments")
    
    def to_dict(self):
        return {
            "id": self.id,
            "bug_id": self.bug_id,
            "user_id":self.user_id,
            "content": self.content,
            "created_at": self.created_at
        }