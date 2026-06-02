from flask import Blueprint


ping_bp = Blueprint('ping', __name__, url_prefix = '/health/')



@ping_bp.route('/ping',methods = ['GET'], strict_slashes = False)
def ping():
    return {'message': "backend is running ",
            'status': "success"},200

