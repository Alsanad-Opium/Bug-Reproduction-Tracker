from app import db
from datetime import datetime,timezone



class Bug(db.Model):
    __tablename__ ="bugs"
    
    id = db.Column(db.Integer, primary_key = True)
    title = db.Column(db.String(100),nullable = False)
    
    description = db.Column(db.Text, nullable = True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable = False)
    
    status = db.Column(db.Enum('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', name='bug_status'),default='OPEN')

    priority = db.Column(db.Enum('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', name='bug_priority'),default='MEDIUM')       
    
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    steps_to_reproduce = db.Column(db.JSON, nullable = True)
    expected_result = db.Column(db.Text, nullable = True)
    actual_result = db.Column(db.Text, nullable = True)
    
    environment_os = db.Column(db.String(50), nullable = True)
    environment_browser = db.Column(db.String(50), nullable = True)
    environment_version = db.Column(db.String(50), nullable = True)
    
    assignee = db.relationship(
        "User",
        back_populates="assigned_bugs",
        foreign_keys=[assigned_to]
    )
    comments = db.relationship(
        "Comment",
        back_populates="bug",
        lazy = True,
        cascade = "all, delete-orphan"
    )
    
    reproduction_attempts = db.relationship('ReproductionAttempt', back_populates = 'bug', lazy = True, cascade = "all, delete-orphan")
    
    
    created_at = db.Column(db.DateTime, nullable = False, default = datetime.now(timezone.utc))
    
    
    
    def get_reproducibility_score(self):
        attempts = self.reproduction_attempts
        
        total_attempts = len(attempts)
        if total_attempts ==  0:
            return None
        
        reproduced = sum(1 for a  in attempts if a.result == 'REPRODUCED')
        return  round((reproduced/total_attempts)*100,1)
    
    def to_dict(self):
        return {
        "id": self.id,
        "title": self.title,
        "description": self.description,
        "steps_to_reproduce": self.steps_to_reproduce,
        "expected_result": self.expected_result,
        "actual_result": self.actual_result,
        "environment": {
            "env_OS": self.environment_os,
            "env_browser": self.environment_browser,
            "env_version":self.environment_version,
        },
        "status": self.status,
        "priority": self.priority,
        "project_id": self.project_id,
        "assigned_to": self.assigned_to,
        "score":self.get_reproducibility_score(),
        "total_attempts":len(self.reproduction_attempts),
        "created_at": self.created_at.isoformat()
    }