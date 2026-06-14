from app import db
from datetime import datetime,timezone

class Comment(db.Model):
    
    __tablename__ = 'comments'
    
    id = db.Columns(db.Integer,primarykey =True, nullable = False, unique = True)

    bug_id = db.Columns(db.Integer, db.ForeignKey('bugs.id'), nullable = False)
    user_id = db.Columns(db.Integer, db.ForeignKey('users.id'), nullable = False)

    content = db.Columns(db.Text, nullable = False)
    created_at = db.Column(db.DateTime, nullable = False, default = datetime.now(timezone.utc))
    
    bug = db.relatioship("Bug", back_populates = "comments")
    user = db.relatioship("User", back_populates = "comments")
    
    def to_dict(self):
        return {
            "id": self.id,
            "bug_id": self.bug_id,
            "user_id":self.user_id,
            "content": self.content,
            "created_at": self.created_at
        }