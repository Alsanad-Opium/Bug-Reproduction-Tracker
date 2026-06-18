from flask import Blueprint, request, jsonify
from app.routes.auth import require_role
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.reproduction import ReproductionAttempt
from app.services.reproduction_service import ReproductionService
from app.utils.validators import validate_enum_input


repo_bp = Blueprint('reproduction',__name__,url_prefix = "/api/bugs") #We reuse /api/bugs as the prefix intentionally. Reproduction attempts belong to a bug, so the URLs read naturally — /api/bugs/1/attempts, /api/bugs/1/score. It makes the API self-documenting.

@repo_bp.route('/<int:bug_id>/attempt',methods = ['POST'], strict_slashes = False)
@require_role('ADMIN','TESTER','DEVELOPER')
@jwt_required()
def log_attempt(bug_id):
    
    user_id = int(get_jwt_identity())
    data = request.get_json()
    error = validate_enum_input(data,'result',['REPRODUCED', 'NOT_REPRODUCED'] )
    if error:
        return jsonify({"message": error}), 400
        
    result = ReproductionService.log_attempt(data,bug_id,user_id )
    if  result['status'] == "not_found":
        return jsonify({
            'message': "Bug not found"
        }),404
       
    if result['status'] == "Invalid":
        return jsonify({
            "message": " There can only two values 'REPRODUCED', 'NOT_REPRODUCED' "
        }),403
            
    return jsonify({'message':"The attempt was added",
                    'attempt': result['attempt']}),201
    
@repo_bp.route('/<int:bug_id>/attempt',methods = ['GET'], strict_slashes = False)
@require_role('ADMIN','TESTER','DEVELOPER')
@jwt_required()
def list_attempts(bug_id):
    
    result = ReproductionService.list_attempts(bug_id) 
             
    return jsonify({'message':"Fetched all attempts",
                    'total_attempts': len(result),
                    'attempts':result
                    }),200
        
        
@repo_bp.route('/<int:bug_id>/score',methods = ['GET'], strict_slashes = False)
@require_role('ADMIN','TESTER','DEVELOPER')
@jwt_required()

def score(bug_id):
    
    attempts = ReproductionService.score(bug_id)
    
    if  not attempts  :
        return jsonify({
            'message': "Bug reproduction attempts not found"
        }),404   
        
    if attempts['status'] == "No_Attempt" :
        return jsonify({
            'bug_id':bug_id,
            'attempt': 'No attempts yet',
             'score': attempts['score']
        }),200
        
        
    return jsonify(
        {
            "bug": bug_id,
            'attempts': attempts['attempts'],
            'successful_attempt': attempts['successful_attempt'],
            'not_successful_attempts': attempts['not_successful_attempts'],
            'score': attempts['score'],
            # 'Details': [a.to_dict() for a in attempts]
         }
    ),200