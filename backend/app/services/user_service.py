from app.models.users import User
from app import db


class UserService:

    @staticmethod
    def update_role(user_id, new_role):
        valid_roles = ['ADMIN', 'DEVELOPER', 'TESTER']

        if new_role not in valid_roles:
            return {"status": "invalid", "message": "role must be ADMIN, DEVELOPER, or TESTER"}

        user = db.session.get(User, user_id)
        if user is None:
            return {"status": "not_found"}

        user.role = new_role
        db.session.commit()

        return {"status": "success", "user": user.to_dict()}