from app import db
from datetime import datetime,timezone



class Bug(db.Model):
    __tablename__ ="bugs"
    
    id = db.Column(db.Integer, primary_key = True)
    title = db.Column(db.String(100),nullable = False)
    
    description = db.Column(db.Text, nullable = True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable = False)
    
    status = db.Column(
    db.Enum('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', name='bug_status'),
    default='OPEN'
)

    priority = db.Column(
    db.Enum('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', name='bug_priority'),
    default='MEDIUM'
)       
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    assignee = db.relationship(
        "User",
        back_populates="assigned_bugs",
        foreign_keys=[assigned_to]
    )
    
    reproduction_attempts = db.relationship('ReproductionAttempt', back_populates = 'bug', lazy = True, cascade = "all, delete-orphan")
    
    
    created_at = db.Column(db.DateTime, nullable = False, default = datetime.now(timezone.utc))
    
    def get_reproducibility_score(self):
        attempts = self.reproduction_attempts
        
        total_attempts = len(attempts)
        
        reproduced = sum(1 for a  in attempts if a.result == 'REPRODUCED')
        return  round((reproduced/total_attempts)*100,1)
    
    def to_dict(self):
        return {
        "id": self.id,
        "title": self.title,
        "description": self.description,
        "status": self.status,
        "priority": self.priority,
        "project_id": self.project_id,
        "assigned_to": self.assigned_to,
        "score":self.get_reproducibility_score(),
        "total_attempts":len(self.reproduction_attempts),
        "created_at": self.created_at.isoformat()
    }