from app import db
from datetime import datetime, timezone


class ReproductionAttempt(db.Model):
    
    __tablename__ = "reproduction_attempts"
    
    id = db.Column(db.Integer, primary_key = True)
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable = False)
    bug_id = db.Column(db.Integer, db.ForeignKey('bugs.id'), nullable = False)
    
    
    result = db.Column(db.Enum('REPRODUCED', 'NOT_REPRODUCED', name = "result_attempt"), nullable = False )
    
    note = db.Column(db.Text, nullable = True)
    
    created_at = db.Column(db.DateTime, nullable = False, default = datetime.now(timezone.utc))
    
    bug = db.relationship('Bug', back_populates = "reproduction_attempts")
    user = db.relationship('User', back_populates = "reproduction_attempts")
    
    def to_dict(self):
        return {
        'id': self.id,
        'user_id': self.user_id,
        'bug_id': self.bug_id,
        'result': self.result,
        'note': self.note,
        'created_at': self.created_at.isoformat()
        }