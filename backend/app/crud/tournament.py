from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.tournament import Tournament, TournamentEnrollment, TournamentStatus
from app.models.match import Match, MatchStatus
from app.schemas.tournament import TournamentCreate
from typing import List

def get_tournaments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Tournament).offset(skip).limit(limit).all()

def get_tournament(db: Session, tournament_id: int):
    return db.query(Tournament).filter(Tournament.id == tournament_id).first()

def create_tournament(db: Session, tournament: TournamentCreate):
    db_tournament = Tournament(name=tournament.name)
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    return db_tournament

def get_enrollments(db: Session, tournament_id: int):
    return db.query(TournamentEnrollment).filter(TournamentEnrollment.tournament_id == tournament_id).all()

def enroll_user(db: Session, tournament_id: int, user_id: int):
    # Verificar si ya está inscrito
    existing = db.query(TournamentEnrollment).filter_by(
        tournament_id=tournament_id, user_id=user_id
    ).first()
    
    if existing:
        return existing
        
    enrollment = TournamentEnrollment(tournament_id=tournament_id, user_id=user_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment

def get_tournament_matches(db: Session, tournament_id: int) -> List[Match]:
    return db.query(Match).filter(Match.tournament_id == tournament_id).order_by(Match.round_number, Match.match_number).all()

def update_tournament_status(db: Session, tournament_id: int, status: TournamentStatus):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if tournament:
        tournament.status = status
        db.commit()
        db.refresh(tournament)
    return tournament
