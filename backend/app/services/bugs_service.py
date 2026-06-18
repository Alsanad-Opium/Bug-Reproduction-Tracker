from app.models.bugs import Bug
from app.models.projects import Project
from app import db

class BugService:
    
    @staticmethod       
    def get_all_bugs(user_id,page,per_page,filters):
       
        query = Bug.query.join(Project).filter(Project.owner_id == user_id)
        
        if filters:
            if filters.get('status'):
                query = query.filter(Bug.status == filters['status'])
            if filters.get('priority'):
                query = query.filter(Bug.priority == filters['priority'])
            if filters.get('assigned_to'):
                query = query.filter(Bug.assigned_to == filters['assigned_to'])
            if filters.get('project_id'):
                query = query.filter(Bug.project_id == filters['project_id'])
                
        pagination = query.paginate(page = page, per_page = per_page, error_out = False)
           
        if not pagination.items:
            return {"status": "Not_found"}
        return {'status':"success", 
                'data': {
                        "bugs": [bug.to_dict() for bug in pagination.items],
                        "pagination": {
                        "page": pagination.page,
                        "per_page": pagination.per_page,
                        "total_items": pagination.total,
                        "total_pages": pagination.pages,
                        "has_next": pagination.has_next,
                        "has_prev": pagination.has_prev}
                        }
                }

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
    
    
    
#     Pagination object with several useful properties:
# pagination.items — the actual list of Bug objects for this page only (not all bugs)

# pagination.page — confirms which page you're on

# pagination.per_page — confirms how many per page

# pagination.total — the total count of bugs matching the filter, across all pages combined (useful for the frontend to show "Page 2 of 8")

# pagination.pages — total number of pages available

# pagination.has_next / pagination.has_prev — booleans telling you if there's a next/previous page, so the frontend knows whether to enable/disable "Next"/"Previous" buttons

# error_out=False — this is important. By default, if someone requests a page number that doesn't exist (like page=999 when there are only 3 pages), SQLAlchemy raises a 404 error automatically. We set error_out=False so it instead just returns an empty items list, and we handle that ourselves with our not pagination.items check — keeping consistent with our own error-handling pattern instead of letting SQLAlchemy throw its own exception.