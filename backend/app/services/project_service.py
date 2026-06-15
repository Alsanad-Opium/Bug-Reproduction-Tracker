from app.models.projects import Project
from app import db


class ProjectService:

    @staticmethod
    def create_project(data, user_id):
        project = Project(
            name=data['name'],
            description=data['description'],
            owner_id=user_id
        )
        db.session.add(project)
        db.session.commit()
        return project.to_dict()

    @staticmethod
    def get_project(project_id):
        project = db.session.get(Project, project_id)
        if project is None:
            return None
        return project.to_dict()

    @staticmethod
    def get_all():
        projects = Project.query.all()
        return [project.to_dict() for project in projects]

    @staticmethod
    def update_project(project_id, data, user_id):
        project = db.session.get(Project, project_id)

        if project is None:
            return {'status': 'not_found'}

        if project.owner_id != user_id:
            return {'status': 'unauthorized'}

        project.name = data.get('name', project.name)
        project.description = data.get('description', project.description)
        db.session.commit()

        return {'status': 'success', 'project': project.to_dict()}