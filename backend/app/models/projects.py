from app import db
from datetime import datetime,timezone



class Project(db.Model):
    __tablename__ ="projects"
    
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(100),nullable = False, unique = True)
    
    description = db.Column(db.Text, nullable = True)
    
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable = False)
    team = db.relationship("Team", back_populates="projects")
    bugs = db.relationship(
    "Bug",
    backref="project",
    lazy=True,
    cascade="all, delete-orphan"
)
    
    created_at = db.Column(db.DateTime, nullable = False, default = datetime.now(timezone.utc))
    
    def to_dict(self, include_bugs=False):
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "team_id": self.team_id,
            "created_at": self.created_at.isoformat(),
        }

        if include_bugs:
            data["bugs"] = [bug.to_dict() for bug in self.bugs]

        return data
        
    def __repr__(self):
        return f"Project ={self.name}, Description = {self.description}, Owner ID = {self.owner_id}, Created At = {self.created_at}"