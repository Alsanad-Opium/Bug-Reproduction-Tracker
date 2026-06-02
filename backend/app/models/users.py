from app import db
from datetime import datetime,timezone

class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(100), nullable = False)
    email = db.Column(db.String(100), unique = True, nullable = False)
    password = db.Column(db.String(100),nullable = False)
    
    projects = db.relationship("Project", backref="owner", lazy=True)
    assigned_bugs = db.relationship("Bug", backref="assignee", lazy=True)
    
    created_at = db.Column(db.DateTime, nullable = False, default = datetime.now(timezone.utc))
    
    
   
    def to_dict(self):
        return{
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at
        }
        
    def __repr__(self):
        return f"User ={self.username}, Email = {self.email}, Created At = {self.created_at}"