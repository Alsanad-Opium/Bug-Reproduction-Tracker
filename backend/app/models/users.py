from app import db,bcrypt
from datetime import datetime,timezone


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(100), nullable = False)
    email = db.Column(db.String(100), unique = True, nullable = False)
    password_hash = db.Column(db.String(225),nullable = False)
    role = db.Column(db.Enum('ADMIN', 'DEVELOPER', 'TESTER', name = 'user_roles'), nullable =False, default = 'TESTER')
    #  Projects owned by user
    projects = db.relationship(
        "Project",
        back_populates="owner",
        lazy=True
    )
    # Bugs assigned to user
    assigned_bugs = db.relationship(
        "Bug",
        back_populates="assignee",
        foreign_keys="Bug.assigned_to",
        lazy=True
    )
    
    reproduction_attempts = db.relationship('ReproductionAttempts', back_populates = 'user', lazy = True)
    
    created_at = db.Column(db.DateTime, nullable = False, default = datetime.now(timezone.utc))
    
    
   
    def to_dict(self):
        return{
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "projects": [p.id for p in self.projects],
            "assigned_bugs": [b.id for b in self.assigned_bugs],
            "created_at": self.created_at.isoformat()
        }
        
    def __repr__(self):
        return f"User ={self.name}, Email = {self.email}, Created At = {self.created_at}"
    
    def set_password(self,password):
        hashed = bcrypt.generate_password_hash(password).decode('utf-8')
        self.password_hash =hashed
        
        
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)