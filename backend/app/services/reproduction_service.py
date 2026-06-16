from app.models.reproduction import ReproductionAttempt
from app.models.bugs import Bug
from app import db


class ReproductionService:
    
    @staticmethod
    def log_attempt(data,bug_id,user_id):
        
        bug = db.session.get(Bug, bug_id)
        if  bug is None:
            return {
                'status': "not_found"
            }
        
        valid_results = ['REPRODUCED', 'NOT_REPRODUCED']      
        
        if data['result'] not in valid_results:
            return {
                "status": "Invalid"
            }
            
        attempt = ReproductionAttempt(
            user_id = user_id,
            bug_id = bug_id,
            result = data['result'],
            note = data.get('note')
        )
        db.session.add(attempt)
        db.session.commit()
        
        return {'status':"success",
                'attempt': attempt.to_dict()}
        
    @staticmethod
    def list_attempts(bug_id):
        
        attempts = ReproductionAttempt.query.filter_by(bug_id=bug_id).all()
        
        return [a.to_dict() for a in attempts]
                    
    @staticmethod
    def score(bug_id):
        
        attempts = ReproductionAttempt.query.filter_by(bug_id=bug_id).all()
        
        total_attempts = len(attempts)
        
        if total_attempts == 0 :
            return {
                'status': "No_Attempt",
                'score': None
            }
            
        reproduced = sum(1 for a  in attempts if a.result == 'REPRODUCED')
        score = round((reproduced/total_attempts)*100,1)
        not_successful_attempts = total_attempts - reproduced
        return {
                'status': 'success',
                "bug": bug_id,
                'attempts': total_attempts,
                'successful_attempt': reproduced,
                'not_successful_attempts': not_successful_attempts,
                'score': score,
                
            }
        