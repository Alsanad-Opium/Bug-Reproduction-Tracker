from app import db,bcrypt
from datetime import datetime,timezone


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(100), nullable = False)
    email = db.Column(db.String(100), unique = True, nullable = False)
    password_hash = db.Column(db.String(100),nullable = False)
    
    #  Projects owned by user
    projects = db.relationship(
        "Project",
        backref="owner",
        lazy=True
    )
    # Bugs assigned to user
    assigned_bugs = db.relationship(
        "Bug",
        back_populates="assignee",
        foreign_keys="Bug.assigned_to",
        lazy=True
    )
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
        hashed = bcrypt.generate_password_hash(password).decode('utf-8')
        self.password_hash =hashed
        
        
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)