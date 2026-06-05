from app import db
from datetime import datetime,timezone



class Project(db.Model):
    __tablename__ ="projects"
    
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(100),nullable = False, unique = True)
    
    description = db.Column(db.Text, nullable = True)
    
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False)
    
    bugs = db.relationship("Bug", backref="project", lazy=True)
    
    created_at = db.Column(db.DateTime, nullable = False, default = datetime.now(timezone.utc))
    
    def to_dict(self):
        return{
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "owner_id": self.owner_id,
            "created_at": self.created_at
        }
        
    def __repr__(self):
        return f"Project ={self.name}, Description = {self.description}, Owner ID = {self.owner_id}, Created At = {self.created_at}"