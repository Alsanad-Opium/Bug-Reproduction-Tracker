from app import db
from datetime import datetime,timezone


class Team(db.Model):
    
    __tablename__ = 'teams'
    
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(50), unique = True, nullable = False)
    description = db.Column(db.Text, nullable = True)
    
    created_at = db.Column(db.DateTime, nullable = False, default = datetime.now(timezone.utc))
    
    memeberships = db.relatioship('TeamMembership', back_populates = 'team', lazy = True, cascade = 'all, delete-orphan')
    projects = db.Column('Project', back_populates = 'team', lazy =True, cascade = 'all, delete-orphan')
    
    
    def to_dict(self):
        return{
            'id':self.id,
            'name' :self.name,
            'description': self.description,
            'member_count' : len(self.memberships),
            'created_at': self.created_at
        }
        


class TeamMembership(db.Model):
    
    __tablename__ = 'team_memberships'
    
    id = db.Column(db.Integer, primary_key = True)
    
    team_id = db.Column(db.Integer, ForeignKey = 'teams.id')
    user_id = db.Column(db.Integer, ForeignKey = 'users.id')
    
    role = db.Column(db.Enum('OWNER', 'MEMBER',name = 'team_role'), nullable = False, default = 'Member')
    
    joined_at = db.Column(db.DateTime, nullable = False, default = datetime.now(timezone.utc))
    
    team = db.relationship('Team', back_populates = 'memberships')
    user = db.relationship('User', back_populates= 'team_memberships')
    
    
    __table_args__ =( db.UniqueConstraintss('team_id','user_id',name = 'uq_team_user'))# this will make sure at the db level no same user is added twice to the same project
    
    
    def to_dict(self):
        
        return{
            'id':self.id,
            'team_id': self.team_id,
            'user_id':self.user_id,
            'user':self.user.name,
            'role':self.role,
            'joined_at':self.joined_at
        }