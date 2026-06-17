from app.models.bugs import Bug
from app.models.projects import Project
from app import db

class BugService:
    
    @staticmethod       
    def get_all_bugs(user_id):
       
        bugs = Bug.query.join(Project).filter(Project.owner_id == user_id).all()
        if not bugs:
            return {"status": "Not_found"}
        return {'status':"success", 'bug': [bug.to_dict() for bug in bugs]}

    @staticmethod
    def get_bug(bug_id):
        bug = db.session.get(Bug, bug_id)
        if bug is None:
            return {"status": "Not_found"}
        return {'status':'success','bug':bug.to_dict()}


    @staticmethod
    def create_bug(data, user_id):
       
        project = db.session.get(Project, data['project_id'])
        
        if not project:
            return {"status": "Project not found"}

        if project.owner_id != user_id:
            return {"status": "Unauthorized"}

        bug = Bug(
            title=data['title'],
            description=data.get('description'),
            project_id=data['project_id'],
            assigned_to=data.get('assigned_to'),
            steps_to_reproduce=data.get('steps_to_reproduce'),
            expected_result=data.get('expected_result'),
            actual_result=data.get('actual_result'),
            environment_os=data.get('environment_os'),
            environment_browser=data.get('environment_browser'),
            environment_version=data.get('environment_version')
                    
        )
        db.session.add(bug)
        db.session.commit()

        return {"status": "Success", "bug": bug.to_dict()}
    
    @staticmethod
    def update_bug_status(data,bug_id):
        bug = db.session.get(Bug, bug_id)
        if bug is None:
            return {"status": "not_found"}

        
        valid_status = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]

        if data.get("status") not in valid_status:
            return {"status": "Invalid status"}

        bug.status = data["status"]
        db.session.commit()

        return {'status': 'Success',"message": "Bug status updated successfully", "bug": bug.to_dict()}

    @staticmethod
    def update_bug_priority(data, bug_id):
        bug = db.session.get(Bug, bug_id)
        
        if bug is None:
            return {"status": "Bug not found"}

        
        valid_priority = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

        if data.get("priority") not in valid_priority:
            return {"status": "Invalid priority"}

        bug.priority = data["priority"]
        db.session.commit()

        return {"status": 'success',"message": "Bug priority updated successfully", "bug": bug.to_dict()}