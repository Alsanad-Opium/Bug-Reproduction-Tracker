from app import db
from datetime import datetime,timezone
from bcrypt import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(100), nullable = False)
    email = db.Column(db.String(100), unique = True, nullable = False)
    password_hash = db.Column(db.String(100),nullable = False)
    
    projects = db.relationship("Project", backref="owner", lazy=True)
    assigned_bugs = db.relationship("Bug", backref="assignee", lazy=True)
    bugs = db.relationship("Bug", backref="project", lazy=True, cascade="all, delete-orphan")
    created_at = db.Column(db.DateTime, nullable = False, default = datetime.now(timezone.utc))
    
    
   
    def to_dict(self):
        return{
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "owner_id": self.owner_id,
            "bugs": [bug.id for bug in self.bugs],
            "created_at": self.created_at.isoformat()
        }
        
    def __repr__(self):
        return f"User ={self.name}, Email = {self.email}, Created At = {self.created_at}"
    
    def set_password(self,password):
        hashed = generate_password_hash(password).decode('utf-8')
        User.password_hash =hashed
        
        
    def check_password(self, password):
        return check_password_hash(password)