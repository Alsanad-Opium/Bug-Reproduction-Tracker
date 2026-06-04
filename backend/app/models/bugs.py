from app import db
from datetime import datetime,timezone
from app import models


class Bug(db.Model):
    __tablename__ ="bug"
    
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(100),nullable = False)
    
    description = db.Column(db.Text, nullable = True)
    
    status = db.Column(db.Enum(['open','in_progress', 'resolved', 'closed']),name = 'bug_status', default = "open")
    
    priority = db.Column(db.Enum(['low', 'medium', 'high', 'critical']), name = 'bug_priority',default = "medium")
    
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable = False)
    
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    bugs = db.relationship("Bug", backref="project", lazy=True)
    
    created_at = db.Column(db.DateTime, nullable = False, default = datetime.now(timezone.utc))