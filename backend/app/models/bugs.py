from app import db
from datetime import datetime,timezone
from app import models


class Bug(db.Model):
    __tablename__ ="bugs"
    
    id = db.Column(db.Integer, primary_key = True)
    title = db.Column(db.String(100),nullable = False)
    
    description = db.Column(db.Text, nullable = True)
    
    status = db.Column(
    db.Enum('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', name='bug_status'),
    default='OPEN'
)

    priority = db.Column(
    db.Enum('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', name='bug_priority'),
    default='MEDIUM'
)
    
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable = False)
    
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    assignee = db.relationship(
        "User",
        back_populates="assigned_bugs",
        foreign_keys=[assigned_to]
    )
    
    
    
    created_at = db.Column(db.DateTime, nullable = False, default = datetime.now(timezone.utc))
    
    
    def to_dict(self):
        return {
        "id": self.id,
        "title": self.title,
        "description": self.description,
        "status": self.status,
        "priority": self.priority,
        "project_id": self.project_id,
        "assigned_to": self.assigned_to,
        "created_at": self.created_at.isoformat()
    }